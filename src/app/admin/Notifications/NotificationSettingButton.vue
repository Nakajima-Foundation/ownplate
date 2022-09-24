<template>
  <div>
    <a
      class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-3"
      @click="openNotificationSettings()"
    >
      <i class="material-icons text-lg text-op-teal xs:mr-1">notifications</i>
      <div
        class="invisible xs:visible text-sm font-bold text-op-teal -mr-2 xs:mr-2"
      >
        {{ $t("admin.order.notification") }}
      </div>

      <div class="font-bold text-red-700 mr-2">{{ orderCounter }}</div>

      <div
        v-if="notificationData.soundOn"
        class="inline-flex justify-center items-center mt-1 space-x-1"
      >
        <div>
          <i class="material-icons text-lg text-green-600">volume_up</i>
        </div>
        <div>
          <div v-if="notificationData.infinityNotification">
            <i class="material-icons text-lg text-green-600">repeat</i>
          </div>
          <div v-else>
            <i class="material-icons text-lg text-green-600">looks_one</i>
          </div>
        </div>
      </div>
      <div v-else>
        <i class="material-icons text-lg text-red-700">volume_off</i>
      </div>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    notificationData: Object,
  },
  methods: {
    openNotificationSettings() {
      this.$emit("openNotificationSettings");
    },
  },
  computed: {
    orderCounter() {
      return Object.keys(this.$store.state.orderObj).reduce((tmp, key) => {
        const count = (this.$store.state.orderObj[key] || []).length;
        return tmp + count;
      }, 0);
    },
  },
};
</script>
