import type { Timestamp } from "./firebaseUtils";

// admins/:uid/messages/:messageId。functions の subAccount（招待）が書き、
// 承認・拒否で accepted と toDisplay を書き換える。id は doc2data が足す。
export type AdminMessageData = {
  id: string;
  fromUid: string;
  toUid: string;
  type: string;
  fromDisplay: boolean;
  toDisplay: boolean;
  email: string;
  createdAt: Timestamp;
  accepted?: boolean;
};

// admins/:uid/children/:childUid。functions の subAccount（招待）が書き、
// 承認で accepted、管理画面のサブアカウント設定で name と restaurantLists を書き換える。
export type SubAccountChildData = {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  accepted?: boolean;
  restaurantLists?: string[];
};
