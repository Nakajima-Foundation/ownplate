<template>
  <div class="bg-white rounded-lg shadow">
    <div class="flex">
      <div class="flex-1 p-4">
        <div class="text-xl font-bold">{{ menu.itemName }}</div>

        <div class="text-4xl mt-2">
          <i class="material-icons">close</i>
          <span>{{ item.count }}</span>
        </div>

        <div class="text-base mt-2">{{ item.option }}</div>
      </div>

      <div class="p-r-16 p-t-16 p-b-16">
        <div class="w-24 is-pulled-right">
          <div v-if="image">
            <img
              :src="image"
              width="96"
              height="96"
              class="w-24 h-24 rounded object-cover"
            />
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
      required: true,
    },
  },
  computed: {
    menu() {
      return this.item.item;
    },
    image() {
      return (
        (this.item.item.images?.item?.resizedImages || {})["600"] ||
        this.item.item.itemPhoto
      );
    },
  },
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
