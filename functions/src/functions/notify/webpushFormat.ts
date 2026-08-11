// Push サービスが受け付ける payload は 4KB 程度が上限なので、本文を切り詰める
const MAX_TEXT_LENGTH = 120;

export type WebPushChild = {
  uid: string;
  restaurantLists: string[];
};

export const adminOrderPath = (restaurantId: string, orderId: string) => {
  return `/admin/restaurants/${restaurantId}/orders/${orderId}`;
};

const truncate = (text: string) => {
  if (text.length <= MAX_TEXT_LENGTH) {
    return text;
  }
  return text.slice(0, MAX_TEXT_LENGTH - 1) + "…";
};

export const createWebPushPayload = (title: string, restaurantName: string, restaurantId: string, orderId: string) => {
  return JSON.stringify({
    title: truncate(title),
    body: truncate(restaurantName),
    // Service Worker 側で origin を補うので、ホスト名を含めないパスを渡す
    url: adminOrderPath(restaurantId, orderId),
    tag: orderId,
  });
};

export const notifyTargetUids = (ownerUid: string, children: WebPushChild[], restaurantId: string) => {
  const childUids = children.filter((child) => child.restaurantLists.includes(restaurantId)).map((child) => child.uid);
  return [ownerUid, ...childUids];
};
