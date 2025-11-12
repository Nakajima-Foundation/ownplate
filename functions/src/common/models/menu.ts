// このファイルは src/models/menu.ts のfunctions版です
// Firebase Admin SDKを使用するため、importを変更しています
import * as admin from "firebase-admin";

// メニュー画像の型定義
export interface MenuImages {
  item?: {
    resizedImages: {
      [key: string]: string; // キー: サイズ（例: "600", "1200"）、値: 画像URL
    };
    original: string; // オリジナル画像のURL
    path?: string; // Storage上のパス
  };
}

// 営業時間の例外設定（特定の時間帯のみ提供するメニュー）
export interface ExceptHour {
  start?: number; // 開始時刻（例: 11 = 11時）
  end?: number; // 終了時刻（例: 14 = 14時）
}

// カテゴリタイトルの型定義
export interface TitleData {
  _dataType: "title"; // データ種別の識別子
  id: string; // ドキュメントID
  name: string; // カテゴリ名

  availableLunch: boolean; // ランチタイムに表示するか
  availableDinner: boolean; // ディナータイムに表示するか
}

// メニューアイテムの型定義
export interface MenuData {
  _dataType: "menu"; // データ種別の識別子
  id: string; // ドキュメントID
  itemDescription: string; // メニューの説明
  itemName: string; // メニュー名
  itemPhoto: string; // メイン画像URL（後方互換性のため残存）
  images: MenuImages; // 画像データ（新形式）
  price: number; // 価格

  tax: string; // 税区分（"food": 軽減税率, "alcohol": 標準税率）

  uid: string; // 作成者のUID
  deletedFlag: boolean; // 削除フラグ（論理削除）

  soldOut: boolean; // 売り切れフラグ
  soldOutToday?: string; // 当日の売り切れ（日付文字列）

  itemAliasesName: string; // 別名（検索用）
  itemMemo: string; // 管理者用メモ
  itemOptionCheckbox: string[]; // オプション（例: ["大盛り", "辛さ調整"]）
  publicFlag: boolean; // 公開フラグ
  allergens: { [key: string]: boolean }; // アレルゲン情報（例: {egg: true, milk: false}）
  category1: string; // カテゴリ1
  category2: string; // カテゴリ2

  availableLunch: boolean; // ランチタイムに提供
  availableDinner: boolean; // ディナータイムに提供

  exceptDay: { [key: string]: boolean }; // 提供しない曜日（例: {0: true} = 日曜日）
  exceptHour: ExceptHour; // 提供時間の制限
  validatedFlag: boolean; // 検証済みフラグ

  createdAt: admin.firestore.FieldValue; // 作成日時（serverTimestamp）
}

// ユーティリティ関数: 営業時間の例外を正規化
// start > end の場合は入れ替える
const newExceptHour = (exceptHour: ExceptHour) => {
  const { start, end } = exceptHour;
  // start or endがnull/undefinedの場合は空オブジェクトを返す
  if (start === null || start === undefined || end === null || end === undefined) {
    return {};
  }
  // 開始時刻 > 終了時刻の場合は入れ替え
  if ((start || 0) > (end || 0)) {
    return {
      start: end,
      end: start,
    };
  }
  return {
    start,
    end,
  };
};

// メニューデータの正規化
// 編集画面から受け取ったデータを、Firestoreに保存する形式に整形
export const getNewItemData = (
  item: MenuData,
  isJP: boolean, // 日本の場合は価格を整数に丸める
  validatedFlag: boolean,
) => {
  const itemData = {
    itemName: item.itemName,
    itemAliasesName: item.itemAliasesName || "",
    price: isJP ? Math.round(Number(item.price)) : Number(item.price),
    tax: item.tax,
    itemDescription: item.itemDescription,
    itemMemo: item.itemMemo,
    itemPhoto: item.itemPhoto,
    images: {
      item: item?.images?.item || {},
    },
    itemOptionCheckbox: item.itemOptionCheckbox || [],
    publicFlag: validatedFlag ? item.publicFlag || false : false,
    allergens: item.allergens,
    validatedFlag,
    category1: item.category1,
    category2: item.category2,
    availableLunch: item.availableLunch || false,
    availableDinner: item.availableDinner || false,
    exceptDay: item.exceptDay || {},
    exceptHour: newExceptHour(item.exceptHour || {}),
  } as MenuData;
  return itemData;
};

// メニューアイテムを複製する関数
// 既存のメニューをコピーして新しいメニューを作成
export const copyMenuData = (item: MenuData, isJP: boolean, uid: string) => {
  const base = getNewItemData(item, isJP, item.validatedFlag);
  const data = Object.assign({}, base, {
    uid, // 作成者を新しいuidに変更
    publicFlag: false, // コピーは非公開状態で作成
    deletedFlag: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(), // 新しいタイムスタンプ
  });
  return data;
};

// ランチ/ディナーの提供可否をチェック
// どちらもfalseの場合は、両方trueとして扱う（デフォルト動作）
export const isAvailableLunchOrDinner = (item: MenuData | TitleData) => {
  const { availableLunch, availableDinner } = item;
  if (!availableLunch && !availableDinner) {
    return { availableLunch: true, availableDinner: true };
  }
  return { availableLunch, availableDinner };
};

// ランチのみ、ディナーのみの判定
export const onlyLunchOrDinner = (item: MenuData) => {
  const { availableLunch, availableDinner } = isAvailableLunchOrDinner(item);
  return {
    onlyLunch: availableLunch && !availableDinner,
    onlyDinner: !availableLunch && availableDinner,
  };
};