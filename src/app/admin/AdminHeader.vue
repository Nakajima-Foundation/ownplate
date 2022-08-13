<template>
  <div>
    <div class="flex space-x-4">
      <div class="flex-shrink-0">
        <back-button :url="backLink" />
      </div>
      <div class="flex-shrink-0">
        <router-link :to="previewLink">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">launch</i>
            <span class="text-sm font-bold text-op-teal">{{
              $t("admin.viewPage")
            }}</span>
          </div>
        </router-link>
      </div>
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
    <div
      class="flex justify-start space-x-4 mt-4 lg:mt-0 lg:mr-4"
      v-if="showSuspend"
    >
      <b-button
        tag="router-link"
        :to="`/admin/restaurants/${restaurantId()}/suspend`"
        class="b-reset-tw"
      >
        <div
          v-if="shopInfo.suspendUntil"
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
      </b-button>

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

export default defineComponent({
  components: {
    BackButton,
    NotificationIndex,
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
  setup(props) {
    const previewLink = computed(() => {
      if (props.isInMo) {
        return "/" + props.moPrefix + "/r/" + props.shopInfo.restaurantId;
      } else {
        return "/r/" + props.restaurantid;
      }
    });
    return {
      previewLink,
    };
  },
});
</script>
