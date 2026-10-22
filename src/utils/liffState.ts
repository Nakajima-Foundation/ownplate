import queryString from "query-string";

// LINE が付けてくる liff.state は「経路?問い合わせ」の形。問い合わせが無いとき、
// 空文字のときで返す形が違う。読む側は liffStateQuery の有無で見分けている。
export const parseLiffState = (liffstate: string) => {
  if (!liffstate) return {};
  const splited = liffstate.split("?");
  if (splited.length < 2) {
    return {
      liffStatePath: splited[0] || "",
      liffStateQuery: {},
    };
  }
  return {
    liffStatePath: splited[0],
    liffStateQuery: queryString.parse(splited[1]),
  };
};

export const classifyOS = (os: string | undefined) => ({
  os,
  isAndroid: os === "android",
  isIOS: os === "ios",
  isWeb: os === "web",
});
