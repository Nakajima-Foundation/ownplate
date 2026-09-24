// Firestore の代わり。**呼ばれた操作を数えるためだけ**にあるので、返す値は
// 「何も無かった」を表す最小のものに固定してある。
//
// これは動作の模倣ではない。見たいのは「権限の無い利用者に対して読み書きが
// 走らないこと」で、それは呼ばれた回数にしか現れない。

export type FirestoreCall = { op: string; path: string };

// 画面が型としてだけ使うもの。値は要らない。
export type DocumentData = Record<string, unknown>;
export type Unsubscribe = () => void;

export const calls: FirestoreCall[] = [];

export const resetCalls = () => {
  calls.length = 0;
};

type Ref = { path: string };

const record = (op: string, ref: unknown): void => {
  const path =
    typeof ref === "object" && ref !== null && "path" in ref
      ? String((ref as Ref).path)
      : "(不明)";
  calls.push({ op, path });
};

// 参照を組み立てるだけのものは数えない。道筋は記録に載せたいので持ち回る。
export const doc = (_db: unknown, ...segments: string[]): Ref => ({
  path: segments.join("/"),
});
export const collection = (_db: unknown, ...segments: string[]): Ref => ({
  path: segments.join("/"),
});
export const query = (ref: Ref): Ref => ref;
export const where = () => ({});
export const orderBy = () => ({});
export const limit = () => ({});
export const startAfter = () => ({});
export const documentId = () => "__name__";
export const serverTimestamp = () => ({ __serverTimestamp: true });
export const increment = (by: number) => ({ __increment: by });
export const arrayUnion = (...values: unknown[]) => ({ __arrayUnion: values });
export const arrayRemove = (...values: unknown[]) => ({
  __arrayRemove: values,
});

export const Timestamp = {
  now: () => ({ seconds: 0, nanoseconds: 0, toDate: () => new Date(0) }),
  fromDate: (date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
  }),
};

// ここからが数える側。
const emptyDoc = { exists: () => false, data: () => undefined, id: "stub" };
const emptyQuery = { docs: [], empty: true, size: 0 };

export const getDoc = async (ref: Ref) => {
  record("getDoc", ref);
  return emptyDoc;
};
export const getDocs = async (ref: Ref) => {
  record("getDocs", ref);
  return emptyQuery;
};
export const setDoc = async (ref: Ref) => {
  record("setDoc", ref);
};
export const addDoc = async (ref: Ref) => {
  record("addDoc", ref);
  return { id: "stub-new" };
};
export const updateDoc = async (ref: Ref) => {
  record("updateDoc", ref);
};
export const deleteDoc = async (ref: Ref) => {
  record("deleteDoc", ref);
};
export const onSnapshot = (ref: Ref) => {
  record("onSnapshot", ref);
  return () => {};
};
