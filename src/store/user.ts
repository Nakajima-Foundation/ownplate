import { ref, computed } from "vue";
import { defineStore } from "pinia";

import { User } from "firebase/auth";

interface Claims {
  admin: boolean;
  operator: boolean;
  parentUid?: string;
  liffId?: string;
  line?: string;
}

export const useUserStore = defineStore("userStore", () => {
  const user = ref<undefined | boolean | User>(undefined);

  const claims = ref<undefined | Claims>(undefined);

  const uid = computed(() => {
    return user.value && (user.value as User).uid;
  });
  const uidAdmin = computed(() => {
    return user.value && (user.value as User).email && (user.value as User).uid;
  });
  const uidUser = computed(() => {
    return (
      user.value && (user.value as User).phoneNumber && (user.value as User).uid
    );
  });
  const uidLiff = computed(() => {
    return (
      user.value && (claims.value as Claims).liffId && (user.value as User).uid
    );
  });
  const liffId = computed(() => {
    return user.value && claims.value?.liffId;
  });
  const isAnonymous = computed(() => {
    return user.value === undefined || user.value === null;
  });
  const isSuperAdmin = computed(() => {
    return claims.value?.admin;
  });
  const isNotSuperAdmin = computed(() => {
    return !claims.value?.admin;
  });
  const isOperator = computed(() => {
    return claims.value?.operator;
  });
  const isNotOperator = computed(() => {
    return !claims.value?.operator;
  });
  const isAdmin = computed(() => {
    return !!(
      user.value &&
      (user.value as User).email &&
      (user.value as User).uid
    );
  });
  const isSubAccount = computed(() => {
    return !!claims.value?.parentUid;
  });
  const parentId = computed(() => {
    return claims.value?.parentUid;
  });

  const setUser = (_user: User) => {
    user.value = _user;
  };
  const setCustomClaims = (_claims: Claims) => {
    // Note: we can't copy user using Object.assign here
    claims.value = _claims;
  };

  return {
    user,
    claims,

    uid,
    uidAdmin,
    uidUser,
    uidLiff,
    liffId,
    isAnonymous,
    isSuperAdmin,
    isNotSuperAdmin,
    isOperator,
    isNotOperator,
    isAdmin,
    isSubAccount,
    parentId,

    setUser,
    setCustomClaims,
  };
});
