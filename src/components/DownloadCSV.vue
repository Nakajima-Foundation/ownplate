<template>
  <span @click="handleDownload()" class="cursor-pointer">
    <slot />
  </span>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";

const regexEscape = /[,\t\n\r]/g;

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
    const escapeCVS = (value) => {
      if (typeof value === "string") {
        return value.replace(regexEscape, " ");
      }
      return value;
    };

    const content = computed(() => {
      const header = (props.fieldNames || props.fields).join(",");
      const rows = props.data
        .map((item) => {
          return props.fields.map((field) => escapeCVS(item[field])).join(",");
        })
        .join("\n");
      const footers = props.formulas
        ? (() => {
            const formulas = props.fields.map((field, index) => {
              if (index === 0) {
                return ctx.root.$t("order.total");
              }
              const formula = props.formulas[field];
              const col = String.fromCharCode(0x41 + index); // Handles only A-Z
              return formula
                ? `=${formula}(${col}2:${col}${props.data.length + 1})`
                : "";
            });
            return `\n${formulas.join(",")}`;
          })()
        : "";
      return `\ufeff${header}\n${rows}${footers}`;
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
