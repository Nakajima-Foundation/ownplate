<template>
  <span @click="handleDownload()">
    <slot></slot>
  </span>
</template>

<script>
// Based on https://github.com/dnrsm/vue-blob-json-csv
export default {
  props: {
    fileName: {
      type: String,
      required: false,
      default: "data"
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
      required: false,
      default: []
    }
  },
  computed: {
    content() {
      const header = (this.fieldNames || this.fields).join(",");
      const rows = this.data
        .map(item => {
          return this.fields
            .map(field => {
              const value = item[field];
              if (typeof value === "object") {
                return JSON.stringify(value);
              }
              return value;
            })
            .join(",");
        })
        .join("\n");
      return `\ufeff${header}\n${rows}`;
    }
  },
  methods: {
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
