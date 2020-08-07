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
    }
  },
  computed: {
    content() {
      const header = (this.fieldNames || this.fields).join(",");
      const rows = this.data
        .map(item => {
          return this.fields
            .map(field => {
              return item[field];
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
