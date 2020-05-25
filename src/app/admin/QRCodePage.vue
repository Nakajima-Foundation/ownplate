<template>
  <section class="section" style="background-color:#fffafa">
    <div class="align-center m-t-24">
      <qrcode :value="url" :options="{ width: 160 }"></qrcode>
      <p>{{$t('admin.qrcode.restaurant')}}</p>
    </div>
  </section>
</template>

<script>
export default {
  computed: {
    url() {
      return this.shareUrl();
    }
  }
};
</script>
