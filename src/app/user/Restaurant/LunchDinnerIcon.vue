<template>
  <i class="material-icons text-center align-middle" v-if="availableLunch">
    lunch_dining
  </i>
  <i class="material-icons text-center align-middle" v-if="availableDinner">
    dinner_dining
  </i>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MenuData, isAvailableLunchOrDinner } from "@/models/menu";

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<MenuData>,
      required: true,
    },
  },
  setup(props) {
    const { availableLunch, availableDinner } = isAvailableLunchOrDinner(
      props.item,
    );
    return {
      availableLunch,
      availableDinner,
    };
  },
});
</script>
