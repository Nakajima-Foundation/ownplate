import type { RouteParamValue } from "vue-router";

// route.params の型は string | string[]。配列になるのは繰り返し（`+` / `*`）の引数だけで、
// このアプリの経路（src/lib/router.ts）には無い。値には触れず、文字列として型を当てる。
// その引数が無い経路で読むと、これまでどおり undefined のまま返る。
export const routeParamOf = (
  value: RouteParamValue | RouteParamValue[] | undefined,
): string => value as string;
