<template>
  <span @click="handleDownload()">
    <slot />
  </span>
</template>

<script>
const regexEscape = /[,\t\n\r]/g;

export default {
  props: {
    fileName: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    fields: {
      type: Array,
      required: true
    },
    fieldNames: {
      type: Array,
      required: false
    },
    formulas: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    content() {
      const header = (this.fieldNames || this.fields).join(",");
      const rows = this.data
        .map(item => {
          return this.fields
            .map(field => this.escapeCVS(item[field]))
            .join(",");
        })
        .join("\n");
      let footers = "";
      if (this.formulas) {
        const formulas = this.fields.map((field, index) => {
          if (index === 0) {
            return this.$t("order.total");
          }
          const formula = this.formulas[field];
          const col = String.fromCharCode(0x41 + index); // Handles only A-Z
          return formula
            ? `=${formula}(${col}2:${col}${this.data.length + 1})`
            : "";
        });
        footers = `\n${formulas.join(",")}`;
      }
      return `\ufeff${header}\n${rows}${footers}`;
    }
  },
  methods: {
    escapeCVS(value) {
      if (typeof value === "string") {
        return value.replace(regexEscape, " ");
      }
      return value;
    },
    handleDownload() {
      const blob = new Blob([this.content], {
        type: `application/csv`
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${this.fileName}.csv`;
      link.click();
      this.$emit("success");
    }
  }
};
</script>
