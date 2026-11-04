<script lang="ts" setup>
	import { computed, inject, provide, reactive, watch, type ComputedRef } from 'vue'
	import { use } from 'echarts/core'
	import { SVGRenderer } from 'echarts/renderers'
	import { PieChart } from 'echarts/charts'
	import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
	import VChart, { THEME_KEY } from 'vue-echarts'
	//以 script 标签直接引入 UMD 产物时，echarts 子模块由全局变量提供，全量 echarts 已注册全部图表，此处过滤后为空
	use([SVGRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent].filter(Boolean))

	provide(THEME_KEY, 'dark')

	//本文件会被用户拷贝到自己的项目中，不能依赖库内部源码，故就地声明用到的性能配置类型
	type IPerfOptions = {
		chartAutoResize: boolean
		minChartInterval: number
	}

	//预览时由 svg-viewer 注入性能配置，编辑器中不存在该注入时按高性能处理
	const perf = inject<ComputedRef<IPerfOptions> | null>('previewPerf', null)
	const chartAutoResize = computed(() => (perf ? perf.value.chartAutoResize : true))
	const chartInterval = computed(() => (perf ? perf.value.minChartInterval : 0))

	const props = defineProps({
		title: {
			type: String,
			default: 'Title'
		},
		seriesName: {
			type: String,
			default: 'Details'
		},
		seriesData: {
			type: Array,
			default: () => []
		}
	})

	const option = reactive({
		title: {
			text: props.title,
			left: 'center'
		},
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b} : {c} ({d}%)'
		},
		legend: {
			orient: 'vertical',
			left: 'left'
		},
		series: [
			{
				name: props.seriesName,
				type: 'pie',
				radius: '55%',
				center: ['50%', '60%'],
				data: props.seriesData,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				}
			}
		]
	})
	let lastChartUpdate = 0
	watch(props, (new_val) => {
		const interval = chartInterval.value
		if (interval > 0) {
			const now = performance.now()
			if (now - lastChartUpdate < interval) {
				return
			}
			lastChartUpdate = now
		}
		option.title.text = new_val.title
		option.series[0].name = new_val.seriesName
		option.series[0].data = new_val.seriesData
	})
</script>

<template>
	<v-chart class="chart" :option="option" :autoresize="chartAutoResize" />
</template>

<style scoped>
	.chart {
		min-height: 300px;
		min-width: 400px;
	}
</style>