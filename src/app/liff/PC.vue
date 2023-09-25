<template>
  <div>
    QRCode
    <div>
      <vue-qrcode :value="liffUrl" :options="{ width: 160 }"></vue-qrcode>
    </div>
    <div>
      <a :href="liffUrl">link</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    liffUrl: {
      type: String,
    },
  },
});
</script>
