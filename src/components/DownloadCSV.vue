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
    createContent() {
      let content = null;
      const names = this.fieldNames.length > 0 ? this.fieldNames : this.fields;
      let csv = `\ufeff${names.join(",")}\n`;
      for (let index = 0; index < this.data.length; index++) {
        const item = this.data[index];
        let line = this.fields
          .map(field => {
            const value = item[field];
            if (typeof value === "object") {
              return JSON.stringify(value);
            }
            return value;
          })
          .join(",");
        csv += `${line}\n`;
      }
      content = csv;
      return content;
    }
  },
  methods: {
    handleDownload() {
      let content = this.createContent;
      if (content === null) {
        this.$emit("error");
        return;
      }
      const blob = new Blob([content], {
        type: `application/${this.fileType}`
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
