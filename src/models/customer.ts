export interface CustomerInfo {
  zip?: string;
  address?: string;
  prefecture?: string;
  // 入力経路で型が変わる。郵便番号から選ぶと数、都道府県の欄から選ぶと文字列。
  prefectureId?: number | string;
  email?: string;
  name?: string;
  location?: { lat: number; lng: number };
}
