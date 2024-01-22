<template>
  <div>
    <h1>Bitcoin Price Chart (2017-07-01 to 2018-03-07)</h1>
    <p>Pressing the <span>delete</span> text deletes the annotation.</p>
    <line-chart :chartData="chartData" :annotationList="annotationList" @delete-annotation="removeAnnotation" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount } from "vue";

import LineChart from "./components/LineChart.vue";
import type { Annotation, AnnotationData, ChartDataItem } from "@/types/types";
import { getDateData, initialAnnotations } from "./data/annotations";

const annotationList = ref<Annotation<AnnotationData>[]>([]);
const chartData = ref<ChartDataItem[]>([]);

const fetchChartData = async (): Promise<ChartDataItem[]> => {
  const startDate = '2017-07-01'; 
  const endDate = '2018-03-07';
  const query = `start=${startDate}&end=${endDate}`;

  try {
    const response = await fetch(`https://api.coindesk.com/v1/bpi/historical/close.json?${query}`);
    const { bpi }: {
      [date: string]: number
    } = await response.json();
    return Object.entries(bpi).map(([key, value]: [string, number]) => ({ date: new Date(key), value }));
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; // Handle error gracefully
  }
};

const removeAnnotation = (payload: string) => {
  annotationList.value = annotationList.value.filter(x => x.id !== payload);
}

onBeforeMount(() => {
  fetchChartData()
    .then(data => {
      chartData.value = data;
      annotationList.value = initialAnnotations.map((annotation) => {
        if (annotation.data) {
          return {
            ...annotation,
            data: getDateData(annotation.data.date, data),
          };
        } else {
          return annotation;
        }
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
});
</script>

<style>
div {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}
.delete-annotation-text {
  cursor: pointer;
  font-family: sans-serif;
  font-size: 0.8rem;
  text-decoration: none;
  font-weight: bold;
  fill: #9D38BD;
}

span {
  color: #9D38BD;
}

</style>