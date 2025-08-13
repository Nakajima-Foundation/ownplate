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

// allow subAccounts
export const checkShopAccount = (shopInfo: RestaurantInfoData, ownerUid: string) => {
  return shopInfo.uid === ownerUid;
};

// only owner
export const checkShopOwner = (shopInfo: RestaurantInfoData, uidAdmin: string) => {
  return shopInfo.uid === uidAdmin;
};
