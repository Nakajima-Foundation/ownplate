<template>
<div>
  <div class="m-4">
    <BarChart :chartData="lineData" />
  </div>
</div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDocs, query, collectionGroup, where, DocumentData } from "firebase/firestore";

import { Chart, ChartData, registerables } from "chart.js";
import { BarChart } from "vue-chart-3";
Chart.register(...registerables);

import moment from "moment";

export default defineComponent({
  components: {
    BarChart,
  },
  setup(_, ctx) {
    const restaurantId = ctx.root.$route.params.restaurantId;

    const logs = ref<DocumentData[]>([]);
    
    const month = "202303";
    
    getDocs(
      query(
        collectionGroup(db, "pageViewData"),
        where("restaurantId", "==", restaurantId),
        where("month", "==", month)
      )
    ).then((logCollection) => {
      logs.value = logCollection.docs.map(logDoc => logDoc.data());
      console.log(logs.value);
    });
    const mergedLog = computed(() => {
      return logs.value.reduce((tmp, log) => {
        tmp[log.date] = (tmp[log.date] || 0) + log.pageviews
        return tmp;
      }, {});
    });
    
    const firstDay = moment(month + "01");
    const lastDay = moment(month + "01").endOf('month');

    const label = firstDay.format("YYYY/MM") + " Page View";

    const days = [...Array(lastDay.date()).keys()].map(n => n + 1); // [1, ..., 31]
    const labels = days.map(n => String(n)); // ["1", ..., "31"]
    const dateKeys = labels.map(n => month + ("0" + n).slice(-2)); // ["20220101", ..."20220131"]

    const resultData = computed(() => {
      return dateKeys.map((datekey) => {
        return mergedLog.value[datekey];
      });
    });
    const lineData = computed(() => {
      return {
        labels,
        datasets: [
          {
            label, 
            data: resultData.value,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };
    })
    return {
      logs,
      lineData,
      mergedLog,
    };
  }

});
</script>
