type Claims = Record<string, unknown>;

// 子の削除は、招待を受けてこの親の子になった相手からだけ親子の印を外す。
// 受けていない相手や別の親の子の権限情報まで消すと、招待するだけで他人の admin を外せてしまう。
export const claimsAfterLeavingParent = (claims: Claims | undefined, parentUid: string): Claims | null => {
  if (!claims || claims.parentUid !== parentUid) {
    return null;
  }
  return Object.fromEntries(Object.entries(claims).filter(([key]) => key !== "parentUid"));
};
