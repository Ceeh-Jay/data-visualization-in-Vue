import * as d3 from 'd3'
import * as d3Annotation from 'd3-svg-annotation'

import type {
  Annotation,
  AnnotationData,
  ChartDataItem,
  ChartDimensions,
  Scales
} from '@/types/types'


export const createSVGWithAttr = (
  chartContainerRef: HTMLDivElement,
  chartDimensions: ChartDimensions
) => {
  d3
    .select(chartContainerRef)
    .append('svg')
    .attr('width', chartDimensions.width)
    .attr('height', chartDimensions.height)
}


export const selectSVG = (chartContainerRef: HTMLDivElement) => {
  return d3.select(chartContainerRef).select<SVGSVGElement>('svg')
}

//IMPORTANT METHOD #1 draw annotations
export const drawAnnotations = (
  chartContainerRef: HTMLDivElement,
  scales: Scales,
  annotationList: Annotation<AnnotationData>[],
  onDeleteClick: (id: string) => void
) => {
  const svg = selectSVG(chartContainerRef)
  const formatTime = d3.isoFormat
  const parseTime = d3.isoParse

  const makeAnnotation = d3Annotation
    .annotation<AnnotationData>()
    .editMode(true)
    .type(d3Annotation.annotationLabel)
    .accessors({
      x: (d) => scales.xScale(parseTime(d.date)!),
      y: (d) => scales.yScale(d.close!)
    })
    .accessorsInverse({
      date: (d: Annotation<AnnotationData>) => formatTime(scales.xScale.invert(d.x!)),
      close: (d: Annotation<AnnotationData>) => scales.yScale.invert(d.y!)
    })
    .annotations(annotationList)

  svg
    .append('g')
    .attr('class', 'annotation-group')
    .call(makeAnnotation as any)

  //Add delete button to each annotation
  svg
    .selectAll('.annotation-note-label')
    .append('tspan')
    .data(annotationList)
    .attr('class', 'delete-annotation-text')
    .text('delete')
    .attr('x', '0')
    .attr('dy', '1.2em')
    .on('click', (event: Event, d: Annotation<AnnotationData>) => {
      console.log('delete annotation', d.id, "d-object", d)
      onDeleteClick(d.id)
    })

  //hover/mouseover effects
  svg
    .selectAll('.annotation')
    .on('mouseover', (event) => {
      d3.select(event.target).attr('opacity', 0.7)
    })
    .on('mouseout', (event) => {
      d3.select(event.target).attr('opacity', 1)
    })
}

//draw linechart
export const drawLineChart = (
  chartContainerRef: HTMLDivElement,
  scales: Scales,
  chartData: ChartDataItem[]
) => {
  const svg = selectSVG(chartContainerRef)

  svg
    .append('path')
    .datum(chartData)
    .attr('fill', 'none')
    .attr('stroke', '#3172bc')
    .attr('stroke-width', 1.5)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr(
      'd',
      d3
        .line<ChartDataItem>()
        .x((d) => scales.xScale(d.date))
        .y((d) => scales.yScale(d.value))
    )
}

//remove annotations
export const removeAnnotations = (chartContainerRef: HTMLDivElement) => {
  const svg = selectSVG(chartContainerRef)
  svg.select<SVGGElement>('.annotation-group').remove()
}

//update initial scales
export const updateScales = (
  chartDimensions: ChartDimensions,
  chartData: ChartDataItem[]
) => {
  const scales = {
    xScale: d3
      .scaleTime()
      .domain(d3.extent(chartData, (d) => d.date) as [Date, Date])
      .range([chartDimensions.margin.left, chartDimensions.width - chartDimensions.margin.right]),
    yScale: d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.value) as number])
      .nice()
      .range([chartDimensions.height, 0])
  }
  return scales
}

// draw Axes:
export const drawAxes = (
  chartContainerRef: HTMLDivElement,
  chartDimensions: ChartDimensions,
  scales: Scales
) => {
  const svg = selectSVG(chartContainerRef)

  svg
    .append('g')
    .attr('transform', `translate(0,${chartDimensions.height - chartDimensions.margin.bottom})`)
    .attr('class', 'x-axis')
    .call(d3.axisBottom(scales.xScale))

  svg
    .append('g')
    .attr('transform', `translate(${chartDimensions.margin.left},0)`)
    .attr('class', 'y-axis')
    .call(d3.axisLeft(scales.yScale))
}
