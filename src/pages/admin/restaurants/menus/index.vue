<template>
  <section class="section">
    <h2 class="p-big bold">
      Menu
    </h2>
    <h2 class="p-big bold">
      Most popular
    </h2>

    <!-- TODO - for -->
    <item-card
      :title="'Kushikatsu Special Platter'"
      :payment="'$26.00'"
      :discription="
        '11 pieces assorted kushikatsu. Served with miso soup and salad.'
      "
      :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"
      @emitting="emitted($event)"
    ></item-card>
    <item-card
      :title="'Spicy Eggplant'"
      :payment="'$8.00'"
      :discription="'Steamed topped with assorted fresh roe and special sauce.'"
      :image="'https://magazine.hitosara.com/image/421/MM_421.jpg'"
      @emitting="emitted($event)"
    ></item-card>
    <b-button
      style="margin-right:auto"
      type="is-info"
      class="counter-button"
      expanded
      rounded
      @click="editMenuItem()"
    >
      Add Item
    </b-button>
  </section>
</template>
<script>
import ItemCard from "~/components/ItemCard";

export default {
  components: {
    ItemCard
  },
  methods: {
    editMenuItem() {
      this.$router.push({
        path: `/admin/restaurants/menus/new/?id=${this.$route.query.id}`
      });
    }
  }
};
</script>
<style lang="stylus" scoped></style>
