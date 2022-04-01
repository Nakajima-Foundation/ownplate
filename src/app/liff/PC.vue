<template>
  <div>
    QRCode
    <div>
      <qrcode :value="liffUrl" :options="{ width: 160 }"></qrcode>
    </div>
    <div>
      <a :href="liffUrl">link</a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    liffUrl: {
      type: String,
    },
  },
};
</script>
