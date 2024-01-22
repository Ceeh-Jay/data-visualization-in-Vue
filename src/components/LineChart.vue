<template>
  <div ref="elChartContainer"></div>
</template>
    
<script lang="ts" setup>
import { onBeforeUpdate, reactive, ref, watch, watchEffect } from "vue";
import { scaleTime, scaleLinear } from 'd3';
import * as d3 from 'd3';

import {
  createSVGWithAttr,
  drawAnnotations,
  drawAxes,
  drawLineChart,
  removeAnnotations,
  updateScales
} from "@/helpers/chart-utils";
import type { Props, Scales } from "@/types/types";

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'delete-annotation', payload: string): void
}>();

const elChartContainer = ref<HTMLDivElement | null>(null);


let scales = reactive<Scales>({
  xScale: scaleTime<number, number>() as d3.ScaleTime<number, number, never>,
  yScale: scaleLinear<number, number>() as d3.ScaleLinear<number, number, never>,
});

const chartDimensions = {
  height: 600,
  margin: { top: 20, right: 30, bottom: 30, left: 40 },
  width: 800,
};

const onDeleteClick = (payload: string) => {
  emit('delete-annotation', payload);
};

onBeforeUpdate(() => {

  removeAnnotations(elChartContainer.value!);

  drawAnnotations(elChartContainer.value!, scales, props.annotationList, onDeleteClick);

});

watch(() => props.chartData, (newChartData) => {
  if (newChartData && newChartData.length > 0) {
    const chartData = props.chartData;
    const annotationList = props.annotationList;

    createSVGWithAttr(elChartContainer.value!, chartDimensions);

    scales = updateScales(chartDimensions, chartData!);

    drawAxes(elChartContainer.value!, chartDimensions, scales);

    drawLineChart(elChartContainer.value!, scales, chartData!);

    drawAnnotations(elChartContainer.value!, scales, annotationList, onDeleteClick);
  }
}, { immediate: true });
</script>
    