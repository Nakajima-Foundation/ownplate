<template>
  <span @click="handleDownload()" class="cursor-pointer">
    <slot />
  </span>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { data2csv } from "@/utils/csv";

export default defineComponent({
  props: {
    fileName: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
    fieldNames: {
      type: Array,
      required: false,
    },
    formulas: {
      type: Object,
      required: false,
      default: null,
    },
  },
  setup(props, ctx) {
    const content = computed(() => {
      return data2csv(props, ctx);
    });

    const handleDownload = () => {
      const blob = new Blob([content.value], {
        type: `application/csv`,
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${props.fileName}.csv`;
      link.click();
      ctx.emit("success");
    };

    return {
      handleDownload,
    };
  },
});
</script>
