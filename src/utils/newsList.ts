// お知らせ一覧に出す「日付・版・1行の要約」。本文の正本は docs/news/*.md で、
// ここはそれを一覧向けに畳むだけ。要約は batch/news.js が生成時に data.ts へ書く。

export type NewsEntry = {
  title: string;
  date: string;
  markdown: string;
  summary: string;
  version: string;
};

export type NewsYear = {
  year: string;
  items: NewsEntry[];
};

const isHeading = (line: string) => line.trimStart().startsWith("#");
const isBullet = (line: string) => line.trimStart().startsWith("-");
const isBlank = (line: string) => line.trim() === "";
const indentOf = (line: string) => line.length - line.trimStart().length;
const bulletText = (line: string) => line.trim().replace(/^-\s*/u, "");

// 箇条書きしか無い回は「分類: 最初の項目」にする。分類（管理系・ユーザー系）だけだと
// 何が変わったのかが分からない。字下げの深さは回によって違うので、見た目の桁ではなく
// 最初の項目より深いかどうかで子を見分ける。
const summaryFromBullets = (lines: string[]): string => {
  const category = lines[0];
  const child = lines.find((line) => indentOf(line) > indentOf(category));
  return child
    ? `${bulletText(category)}: ${bulletText(child)}`
    : bulletText(category);
};

// 冒頭の段落は、読みやすさのために途中で改行してある。1行に戻す（日本語なので詰める）。
const summaryFromParagraph = (lines: string[]): string => {
  const paragraph: string[] = [];
  lines.every((line) => {
    if (isBlank(line) || isBullet(line)) {
      return false;
    }
    paragraph.push(line.trim());
    return true;
  });
  return paragraph.join("");
};

export const newsSummary = (markdown: string): string => {
  const lines = markdown.split("\n").filter((line) => !isHeading(line));
  const first = lines.findIndex((line) => !isBlank(line));
  if (first < 0) {
    return "";
  }
  const body = lines.slice(first);
  return isBullet(body[0])
    ? summaryFromBullets(body.filter((line) => !isBlank(line)))
    : summaryFromParagraph(body);
};

// 題は「v4.1.0 をリリースしました。」の形。一覧では版だけを出す。
export const newsVersion = (title: string): string => {
  const matched = title.match(/^v[0-9]+(?:\.[0-9]+)*/u);
  return matched ? matched[0] : "";
};

// 日付は YYYY-MM-DD。入ってきた並び（新しい順）はそのまま保つ。
export const newsByYear = (list: NewsEntry[]): NewsYear[] =>
  list.reduce<NewsYear[]>((years, entry) => {
    const year = entry.date.slice(0, 4);
    const last = years[years.length - 1];
    if (last && last.year === year) {
      last.items.push(entry);
      return years;
    }
    return [...years, { year, items: [entry] }];
  }, []);
