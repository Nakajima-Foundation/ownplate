<template>
  <div>
    <div class="flex space-x-4">
      <div class="flex-shrink-0">
        <back-button :url="backLink" />
      </div>
      <PreviewLink :shopInfo="shopInfo" :isInMo="isInMo" :moPrefix="moPrefix" />
    </div>

    <!-- Photo and Name -->
    <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
      <div class="flex items-center">
        <div class="flex-shrink-0 rounded-full bg-black bg-opacity-10 mr-4">
          <img
            :src="resizedProfileImage(shopInfo, '600')"
            class="w-9 h-9 rounded-full object-cover"
          />
        </div>
        <div class="text-base font-bold">
          {{ shopInfo.restaurantName }}
        </div>
      </div>
    </div>

    <!-- Suspend Button -->
    <div class="flex space-x-4 mt-4 lg:mt-0">
      <o-button
        tag="router-link"
        :to="`/admin/restaurants/${restaurantId()}/suspend`"
        class="b-reset-tw"
        v-if="showSuspend"
      >
        <div
          v-if="suspendUntil"
          class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-red-700 bg-opacity-5"
        >
          <i class="material-icons text-lg text-red-700 mr-2"
            >remove_shopping_cart</i
          >
          <div class="text-sm font-bold text-red-700">
            {{ $t("admin.order.suspending") }}
          </div>
        </div>

        <div
          v-else
          class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
        >
          <i class="material-icons text-lg text-op-teal mr-2"
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

<script>
import { defineComponent, computed } from "@vue/composition-api";
import BackButton from "@/components/BackButton.vue";
import NotificationIndex from "./Notifications/Index.vue";
import PreviewLink from "@/app/admin/common/PreviewLink.vue";

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
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
      required: false,
    },
  },
  setup(props, ctx) {
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
    };
  },
});
</script>
