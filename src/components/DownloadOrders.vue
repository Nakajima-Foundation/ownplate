<template>
  <download-csv :data="tableData" :fields="fields" :fieldNames="fieldNames" :fileName="fileName">
    <b-button class="m-t-16 b-reset h-36 r-36 bg-form">
      <span class="p-l-16 p-r-16">
        <i class="material-icons c-primary s-18 m-r-8">save_alt</i>
        <span class="c-primary t-button">Download CSV</span>
      </span>
    </b-button>
  </download-csv>
</template>

<script>
import DownloadCsv from "~/components/DownloadCSV";
export default {
  components: {
    DownloadCsv
  },
  computed: {
    fields() {
      return ["date"];
    },
    fieldNames() {
      return this.fields.map(field => {
        return this.$t(`order.${field}`);
      });
    },
    tableData() {
      return [
        {
          date: "abc"
        }
      ];
    }
  }
};
</script>
