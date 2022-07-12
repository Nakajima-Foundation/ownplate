<template>
  <div>
    {{item.itemName }}
    <img :src="image" class="w-12" />
    num:{{quantity}}
    <div v-for="(option, k) in options" :key="k">
      <div v-if="option.length === 1">
        <div v-if="selectedOptions[k]">
          Option:{{option[0]}}
        </div>
      </div>
      <div v-else-if="option.length > 1">
        Option:{{option[selectedOptions[k]]}}
      </div>
    </div>
    <hr/>
  <br/>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { itemOptionCheckbox2options } from "@/utils/utils";

export default defineComponent({
  props: {
    item: {
      type: Object,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    selectedOptions: {
      type: Array,
      required: true,
    },
  },
  setup(props, ctx) {
    const image = computed(() => {
      return (props.item?.images?.item?.resizedImages || {})["600"] || props.item.itemPhoto;
    });
    const options = computed(() => {
      return itemOptionCheckbox2options(props.item.itemOptionCheckbox);
    });
    
    return {
      image,
      options,
    };
  },
})
</script>
