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
  const user = ref<User | null | undefined>(undefined);
  const claims = ref<Claims | null | undefined>(undefined);

  const uid = computed(() => user.value?.uid);
  const uidAdmin = computed(() =>
    user.value?.email ? user.value.uid : undefined,
  );
  const uidUser = computed(() =>
    user.value?.phoneNumber ? user.value.uid : undefined,
  );
  const uidLiff = computed(() =>
    user.value && claims.value?.liffId ? user.value.uid : undefined,
  );
  const liffId = computed(() =>
    user.value ? claims.value?.liffId : undefined,
  );
  const isAnonymous = computed(
    () => user.value === undefined || user.value === null,
  );
  const isSuperAdmin = computed(() => claims.value?.admin);
  const isNotSuperAdmin = computed(() => !claims.value?.admin);
  const isOperator = computed(() => claims.value?.operator);
  const isNotOperator = computed(() => !claims.value?.operator);
  const isAdmin = computed(() => !!(user.value?.email && user.value?.uid));
  const isSubAccount = computed(() => !!claims.value?.parentUid);
  const parentId = computed(() => claims.value?.parentUid);

  const setUser = (_user: User | null) => {
    user.value = _user;
  };
  const setCustomClaims = (_claims: Claims | null) => {
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
