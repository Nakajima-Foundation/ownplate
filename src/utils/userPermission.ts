import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";

export const checkAdminPermission = () => {
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  if (!store.getters.uidAdmin) {
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
export const checkShopAccount = (shopInfo: any, ownerUid: string) => {
  return shopInfo.uid === ownerUid;
};

// only owner
export const checkShopOwner = (shopInfo: any, uidAdmin: string) => {
  return shopInfo.uid === uidAdmin;
};
