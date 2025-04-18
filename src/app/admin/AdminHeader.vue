<template>
  <div>
    <div class="flex space-x-4">
      <div class="shrink-0">
        <back-button
          :url="backLink"
          :iconText="iconText"
          :backText="backText"
        />
      </div>
      <PreviewLink :shopInfo="shopInfo" />
    </div>

    <!-- Photo and Name -->
    <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
      <div class="flex items-center">
        <div class="mr-4 shrink-0 rounded-full bg-black bg-opacity-10">
          <img
            :src="resizedProfileImage(shopInfo, '600')"
            class="h-9 w-9 rounded-full object-cover"
          />
        </div>
        <div class="text-base font-bold">
          {{ shopInfo.restaurantName }}
          <span v-if="pageText">/ {{ $t("adminTitle." + pageText) }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 flex lg:mt-0">
      <!-- Suspend Button -->
      <o-button
        tag="router-link"
        :to="`/admin/restaurants/${restaurantId}/suspend`"
        class="b-reset-tw"
        v-if="showSuspend"
      >
        <div
          v-if="suspendUntil"
          class="inline-flex h-9 items-center justify-center rounded-full bg-red-700 bg-opacity-5 px-4 mr-4"
        >
          <i class="material-icons mr-2 text-lg text-red-700"
            >remove_shopping_cart</i
          >
          <div class="text-sm font-bold text-red-700">
            {{ $t("admin.order.suspending") }}
          </div>
        </div>

        <div
          v-else
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4 mr-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal"
            >remove_shopping_cart</i
          >
          <div class="text-sm font-bold text-op-teal">
            {{ $t("admin.order.suspendSettings") }}
          </div>
        </div>
      </o-button>
      <!-- Notifications -->
      <div>
        <notification-index :shopInfo="shopInfo" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import BackButton from "@/components/BackButton.vue";
import NotificationIndex from "@/app/admin/Notifications/Index.vue";
import PreviewLink from "@/app/admin/common/PreviewLink.vue";

import { useRestaurantId, resizedProfileImage } from "@/utils/utils";

export default defineComponent({
  components: {
    BackButton,
    NotificationIndex,
    PreviewLink,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    backLink: {
      type: String,
      required: true,
    },
    showSuspend: {
      type: Boolean,
      required: true,
    },
    iconText: {
      type: String,
      required: false,
    },
    backText: {
      type: String,
      required: false,
    },
    pageText: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const restaurantId = useRestaurantId();
    const suspendUntil = computed(() => {
      if (props.shopInfo.suspendUntil) {
        const time = props.shopInfo.suspendUntil.toDate();
        if (time < new Date()) {
          return false;
        }
        return true;
      }
      return false;
    });

    return {
      suspendUntil,
      restaurantId,
      resizedProfileImage,
    };
  },
});
</script>
