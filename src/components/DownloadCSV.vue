<template>
  <component :is="tagName" ref="download" @click="handleDownload()">
    <template v-if="title === ''">
      <slot></slot>
    </template>
    <template>{{ title }}</template>
  </component>
</template>

<script>
export default {
  name: "VueBlobJsonCsv",
  props: {
    tagName: {
      type: String,
      required: false,
      default: "span"
    },
    title: {
      type: String,
      required: false,
      default: ""
    },
    fileType: {
      type: String,
      required: true,
      default: ""
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
    confirm: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    createContent() {
      let content = null;
      if (this.fileType === "json") {
        content = JSON.stringify(this.data);
      } else if (this.fileType === "csv") {
        const keys =
          this.fields.length > 0 ? this.fields : Object.keys(this.data[0]);
        let csv = `\ufeff${keys.join()}\n`;
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
      }
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
      if (this.confirm !== null) {
        const result = confirm(this.confirm);
        if (!result) return;
      }
      const blob = new Blob([content], {
        type: `application/${this.fileType}`
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${this.fileName}.${this.fileType}`;
      link.click();
      this.$emit("success");
    }
  }
};
</script>
