import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import { RestaurantInfoData } from "../models/RestaurantInfo";

export const checkAdminPermission = () => {
  const userStore = useUserStore();
  const router = useRouter();
  const route = useRoute();
  if (!userStore.uidAdmin) {
    const redirectUrl = encodeURIComponent(route.path);
    if (redirectUrl) {
      router.replace("/admin/user/signin?to=" + redirectUrl);
    } else {
      router.replace("/admin/user/signin");
    }
    return false;
  }
  return true;
};

// 呼び手が渡す uid は「まだ分かっていない」ことがある（サインインの確認前など）。
// そのときは一致しない扱いにする。両方が undefined でも通してはいけない。
const belongsTo = (shopInfo: RestaurantInfoData, uid: string | undefined) =>
  uid !== undefined && shopInfo.uid === uid;

// allow subAccounts
export const checkShopAccount = (
  shopInfo: RestaurantInfoData,
  ownerUid: string | undefined,
) => belongsTo(shopInfo, ownerUid);

// only owner
export const checkShopOwner = (
  shopInfo: RestaurantInfoData,
  uidAdmin: string | undefined,
) => belongsTo(shopInfo, uidAdmin);
