<template>
  <div>
    <div class="bg-surface r-8 d-low m-t-8">
      <div class="cols">
        <div class="flex-1 p-l-16 p-r-16 p-t-16 p-b-16">
          <div class="t-h6 c-text-black-high">{{ menu.itemName }}</div>
          <div class="t-h4 c-text-black-medium m-t-8">
            <i class="material-icons" style="vertical-align: middle;">close</i>
            <span>{{ item.count }}</span>
          </div>
          <div class="t-body1 c-text-black-high m-t-8">{{ item.option }}</div>
        </div>
        <div class="p-r-16 p-t-16 p-b-16">
          <div class="w-96 is-pulled-right">
            <div v-if="image">
              <img :src="image" width="96" height="96" class="w-96 h-96 r-4 cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    menu() {
      return this.item.menu;
    },
    image() {
      return (
        (this.item.menu.images?.item?.resizedImages || {})["600"] ||
        this.item.menu.itemPhoto
      );
    }
  },
  mounted() {
    //console.log(this.item.menu);
  }
};
</script>

<style scoped>
.image.thumbnail {
  height: 6em !important;
  width: 6em !important;
  margin-top: -0.8rem;
  margin-right: -0.8rem;
}
</style>
