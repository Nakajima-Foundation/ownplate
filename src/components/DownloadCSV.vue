<template>
  <component :is="tagName" ref="download" @click="handleDownload()">
    <slot></slot>
  </component>
</template>

<script>
// Based on https://github.com/dnrsm/vue-blob-json-csv
export default {
  props: {
    tagName: {
      type: String,
      required: false,
      default: "span"
    },
    fileName: {
      type: String,
      required: false,
      default: "data"
    },
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    fields: {
      type: Array,
      required: false,
      default: () => []
    },
    fieldNames: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    createContent() {
      let content = null;
      const keys =
        this.fields.length > 0 ? this.fields : Object.keys(this.data[0]);
      const names = this.fieldNames.length > 0 ? this.fieldNames : keys;
      let csv = `\ufeff${names.join()}\n`;
      for (let index = 0; index < this.data.length; index++) {
        const item = this.data[index];
        let line = keys
          .map(key => {
            if (item[key] === null) {
              return null;
            } else if (typeof item[key] === "object") {
              return JSON.stringify([item[key]]);
            } else {
              return [item[key]];
            }
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
