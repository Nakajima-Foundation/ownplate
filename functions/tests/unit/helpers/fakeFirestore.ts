// メモリ上の偽の Firestore。注文の関数が使う操作（doc の get / update / set、collection().doc()、
// runTransaction）だけを持つ。書き込みは log に順に残し、終わったあとの中身は store で読む。
type Fields = Record<string, unknown>;

const copyOf = <T>(value: T): T => (value === undefined ? value : structuredClone(value));
const normalized = (path: string) => path.replace(/^\//, "");

// 本物の Firestore は、配列の中に配列がある値を保存できず、書き込みを断る。
const hasNestedArray = (value: unknown, insideArray = false): boolean => {
  if (Array.isArray(value)) {
    return insideArray || value.some((element) => hasNestedArray(element, true));
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value).some((child) => hasNestedArray(child, false));
  }
  return false;
};
const assertStorable = (path: string, data: unknown) => {
  if (hasNestedArray(data)) {
    throw new Error(`INVALID_ARGUMENT: nested arrays are not supported (${path})`);
  }
};

export const fakeFirestore = (initial: Record<string, Fields>) => {
  Object.entries(initial).forEach(([path, data]) => assertStorable(path, data));
  const store = new Map<string, Fields>(Object.entries(copyOf(initial)));
  const log: string[] = [];

  const docRef = (rawPath: string) => {
    const path = normalized(rawPath);
    const id = path.split("/").pop();
    return {
      path,
      id,
      get: async () => ({ exists: store.has(path), id, data: () => copyOf(store.get(path)) }),
      update: async (fieldOrData: string | Fields, value?: unknown) => {
        const current = store.get(path);
        if (!current) {
          throw new Error(`NOT_FOUND: ${path}`);
        }
        const patch = typeof fieldOrData === "string" ? { [fieldOrData]: value } : fieldOrData;
        assertStorable(path, patch);
        log.push(`update ${path} ${JSON.stringify(patch)}`);
        store.set(path, { ...current, ...copyOf(patch) });
      },
      set: async (data: Fields, options?: { merge?: boolean }) => {
        assertStorable(path, data);
        log.push(`set ${path} ${JSON.stringify(data)}`);
        store.set(path, options?.merge ? { ...(store.get(path) ?? {}), ...copyOf(data) } : copyOf(data));
      },
      collection: (name: string) => ({ doc: (childId: string) => docRef(`${path}/${name}/${childId}`) }),
    };
  };
  type DocRef = ReturnType<typeof docRef>;

  const transaction = {
    get: (ref: DocRef) => ref.get(),
    update: (ref: DocRef, fieldOrData: string | Fields, value?: unknown) => ref.update(fieldOrData, value),
    set: (ref: DocRef, data: Fields, options?: { merge?: boolean }) => ref.set(data, options),
  };
  const db = {
    doc: docRef,
    collection: (path: string) => ({ doc: (id: string) => docRef(`${normalized(path)}/${id}`) }),
    runTransaction: async <T>(work: (tr: typeof transaction) => Promise<T>) => work(transaction),
  };
  return { db, store, log };
};
