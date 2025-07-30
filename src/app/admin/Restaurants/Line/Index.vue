<template>
  <div>
    <div v-if="notFound == null"></div>
    <div v-else-if="notFound == true">
      <NotFound />
    </div>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-4 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="`/admin/restaurants/#restaurant_` + shopInfo.restaurantId"
        :showSuspend="false"
        pageText="lineAuth"
      />

      <!-- Body -->
      <div class="grid-col-1 mx-6 mt-4 space-y-4 lg:mx-auto lg:max-w-2xl">
        <!-- Title -->
        <div class="text-xl font-bold text-black/30">
          {{ $t("admin.line.settings") }}
        </div>
      </div>
      <div class="m-6 font-bold">
        <ul>
          <li>{{ $t("admin.line.notice1") }}</li>
          <li>{{ $t("admin.line.notice2") }}</li>
          <li>{{ $t("admin.line.notice3") }}</li>
          <li>{{ $t("admin.line.notice4") }}</li>
          <li>{{ $t("admin.line.notice5") }}</li>
        </ul>
      </div>

      <hr class="my-4 border border-solid border-black/5" />

      <div class="m-6">
        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.line.loginClientId") }}
          <span class="cursor-pointer" @click="open('loginClientId')">?</span>
        </div>
        <div>
          <o-input type="text" v-model="clientId" />
        </div>

        <div class="mt-2 pb-2 text-sm font-bold">
          {{ $t("admin.line.loginChannelSecret") }}
          <span class="cursor-pointer" @click="open('loginChannelSecret')"
            >?</span
          >
        </div>
        <div>
          <o-input type="text" v-model="client_secret" />
        </div>

        <div class="mt-2 pb-2 text-sm font-bold">
          {{ $t("admin.line.messagingAccessToken") }}
          <span class="cursor-pointer" @click="open('messagingAccessToken')"
            >?</span
          >
        </div>
        <div>
          <o-input type="text" v-model="message_token" />
        </div>

        <hr class="my-4 border border-solid border-black/5" />

        <div class="pb-2 text-sm font-bold">
          {{ $t("admin.line.callbackUrl") }}
          <span class="cursor-pointer" @click="open('callback')">?</span>
        </div>

        <div>
          <o-input type="text" :modelValue="callbackUrl" />
        </div>

        <div class="mt-4 pb-2 text-sm font-bold">
          <o-checkbox v-model="hasLine" :disabled="!ok" />
          {{ $t("admin.line.enabled") }}
        </div>

        <!-- Save Button -->
        <div class="mt-4 text-center">
          <t-button
            @click="save"
            :isDisabled="isSaving"
            class="h-12 px-8 font-bold text-white"
          >
            {{ $t(isSaving ? "editCommon.saving" : "editCommon.save") }}
          </t-button>
        </div>
      </div>
      <t-modal
        width="488"
        scroll="keep"
        @dismissed="closeImage"
        v-model:active="imagePopup"
      >
        <div class="bg-white p-4">
          <div v-if="iType == 'loginClientId'">
            <div class="text-sm font-bold">
              LINEログインチャンネルのチャンネル基本設定のチャンネルIDをコピーして設定してください。
            </div>
            <img src="/images/lines/lineLoginId.png" class="p-4" />
          </div>
          <div v-if="iType == 'loginChannelSecret'">
            <div class="text-sm font-bold">
              LINEログインチャンネルのチャンネル基本設定のチャンネルシークレットをコピーして設定してください。
            </div>
            <img src="/images/lines/lineLoginHeader.png" class="p-4" />
            <div class="bg-gray-200">
              {{ $t("admin.line.showBelow") }}
            </div>
            <img src="/images/lines/lineLoginSecret.png" class="p-4" />
          </div>
          <div v-if="iType == 'messagingAccessToken'">
            <div class="text-sm font-bold">
              LINE Messaging APIのMessaging
              API設定のチャンネルアクセストークンをコピーして設定してください。
            </div>
            <img src="/images/lines/lineMessageToken.png" class="p-4" />
            <img src="/images/lines/lineMessageHeader.png" class="p-4" />
          </div>
          <div v-if="iType == 'callback'">
            <div class="text-sm font-bold">
              この値をコピーして、LINEログインチャンネルのLINEログイン設定の「コールバックURL」に設定してください。
            </div>
            <!-- <img src="//images/lines/lineLoginCallback.png" class="p-4" /> -->
          </div>
        </div>
      </t-modal>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

import { checkShopAccount } from "@/utils/userPermission";
import { useAdminUids, notFoundResponse } from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    const { ownerUid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    // {{ shopInfo.hasLine}}
    const hasLine = ref(props.shopInfo.hasLine || false);
    const clientId = ref(props.shopInfo.lineClientId);
    const client_secret = ref("");
    const message_token = ref("");

    // /restaurants/${restaurantId}/private/line
    getDoc(
      doc(db, `/restaurants/${props.shopInfo.restaurantId}/private/line`),
    ).then((shopDoc) => {
      const data = shopDoc.data();
      if (data) {
        client_secret.value = data.client_secret;
        message_token.value = data.message_token;
      }
    });
    const imagePopup = ref(false);
    const iType = ref("");

    const open = (imageType: string) => {
      imagePopup.value = true;
      iType.value = imageType;
    };
    const closeImage = () => {
      imagePopup.value = false;
    };

    const callbackUrl =
      location.origin + "/callback/" + props.shopInfo.restaurantId + "/line";

    const ok = computed(() => {
      return (
        clientId.value !== "" &&
        client_secret.value !== "" &&
        message_token.value !== ""
      );
    });

    const isSaving = ref(false);
    const save = async () => {
      isSaving.value = true;
      await Promise.all([
        setDoc(
          doc(db, `/restaurants/${props.shopInfo.restaurantId}/private/line`),
          {
            client_secret: client_secret.value || "",
            message_token: message_token.value || "",
          },
          { merge: true },
        ),
        setDoc(
          doc(db, `/restaurants/${props.shopInfo.restaurantId}`),
          {
            hasLine: hasLine.value,
            lineClientId: clientId.value,
          },
          { merge: true },
        ),
      ]);
      router.push({
        path: `/admin/restaurants`,
        hash: `#restaurant_` + props.shopInfo.restaurantId,
      });
      isSaving.value = false;
    };
    return {
      imagePopup,
      notFound: false,
      clientId,
      client_secret,
      message_token,
      ok,
      save,
      closeImage,

      callbackUrl,
      hasLine,
      open,
      iType,
      isSaving,
    };
  },
});
</script>
