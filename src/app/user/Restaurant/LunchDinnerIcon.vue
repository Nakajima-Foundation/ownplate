<template>
  <i class="material-icons text-center" v-if="availableLunch"> lunch_dining </i>
  <i class="material-icons text-center" v-if="availableDinner"> dinner_dining </i>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from "vue";
import { MenuData, isAvailableLunchOrDinner } from "@/models/menu";

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<MenuData>,
      required: true,
    }, 
  },
  setup(props) {
    return {
      ...isAvailableLunchOrDinner(props.item),
    };
  },
});
</script>
