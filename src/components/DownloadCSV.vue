<template>
  <span @click="handleDownload()" class="cursor-pointer">
    <slot />
  </span>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { data2csv, type CsvRow } from "@/utils/csv";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<CsvRow[]>,
      required: true,
    },
    fields: {
      type: Object as PropType<string[]>,
      required: true,
    },
    fieldNames: {
      type: Object as PropType<string[]>,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    formulas: {
      type: Object as PropType<{ [key: string]: string }>,
      required: false,
    },
  },
  emits: ["success"],
  setup(props, ctx) {
    const { t } = useI18n({ useScope: "global" });
    const content = computed(() => {
      return data2csv(
        {
          data: props.data,
          fields: props.fields,
          fieldNames: props.fieldNames,
          formulas: props.formulas,
        },
        t,
      );
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
