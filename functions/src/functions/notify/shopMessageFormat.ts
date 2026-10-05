// 店舗向け timeline に残す1件の形。Firestore に依らないので単体で試験できる。
//
// LINE の talk が店にとっての控えだった。畳むと「何を知らされたか」を遡る先が
// 無くなるので、送った内容をこちらに残す。**届いたかどうかは持たない** —
// それは Web Push のログの仕事で、ここは「何を伝えたか」だけ。

export const SHOP_MESSAGE_COLLECTION = "messages";

// 注文と種別から作るので、同じ通知が二度走っても行が増えない。
export const shopMessageId = (orderId: string, messageId: string): string =>
  `${orderId}-${messageId}`;

export type ShopMessageRecord = {
  // 実際に送った文面。あとから組み直すと「送っていない文面」を見せることになる。
  text: string;
  // 種別（msg_order_placed など）。画面で色分けや絞り込みに使う。
  messageId: string;
  orderId: string;
  orderNumber: number;
  // 注文へ飛ぶ先。LINE では文面の末尾に付けていた URL の代わり。
  path: string;
  restaurantId: string;
};

export const shopMessageRecord = (params: {
  text: string;
  messageId: string;
  orderId: string;
  orderNumber: number;
  restaurantId: string;
}): ShopMessageRecord => ({
  text: params.text,
  messageId: params.messageId,
  orderId: params.orderId,
  orderNumber: params.orderNumber,
  path: `/admin/restaurants/${params.restaurantId}/orders/${params.orderId}`,
  restaurantId: params.restaurantId,
});
