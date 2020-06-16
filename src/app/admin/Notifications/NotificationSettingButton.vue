<template>
  <div class="op-button-pill bg-form m-t-24" @click="openNotificationSettings()">
    <i class="material-icons">notifications</i>
    <span class="t-button">
      {{
      $t("admin.order.notification")
      }}
    </span>
    <!-- # Show total incomplete number -->
    <span class="t-button c-status-red">{{orderCounter}}</span>
    <span v-if="notification_data.soundOn">
      <i class="material-icons c-status-green s-18">volume_up</i>
      <span v-if="notification_data.infinityNotification">
        <i class="material-icons c-status-green s-18">repeat</i>
      </span>
      <span v-else>
        <i class="material-icons c-status-green s-18">looks_one</i>
      </span>
    </span>
    <i v-else class="material-icons c-status-red s-18">volume_off</i>
  </div>
</template>

<script>
export default {
  props: {
    notification_data: Object
  },
  methods: {
    openNotificationSettings() {
      this.$emit("openNotificationSettings");
    }
  },
  computed: {
    orderCounter() {
      return Object.keys(this.$store.state.orderObj).reduce((tmp, key) => {
        const count = (
          this.$store.state.orderObj[key] ||
            []
        ).length;
        console.log(count);
        return tmp + count;
      }, 0);
    }
  }
};
</script>
