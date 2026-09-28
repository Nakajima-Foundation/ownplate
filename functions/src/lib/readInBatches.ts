// items を size 件ずつ順に読む。done が true を返したら、残りは読まない。
export const readInBatches = async <T, R>(items: T[], size: number, read: (item: T) => Promise<R[]>, done: (sofar: R[]) => boolean = () => false): Promise<R[]> => {
  const batches = Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
  return batches.reduce<Promise<R[]>>(async (previous, batch) => {
    const sofar = await previous;
    return done(sofar) ? sofar : [...sofar, ...(await Promise.all(batch.map(read))).flat()];
  }, Promise.resolve([]));
};
