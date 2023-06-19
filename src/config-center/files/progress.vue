<script setup lang="ts">
	import { ElProgress } from 'element-plus'
	import type { ProgressColor } from 'element-plus'
	import { watch } from 'vue'

	const colors: ProgressColor[] = [
		{
			color: '#f56c6c',
			percentage: 20
		},
		{
			color: '#e6a23c',
			percentage: 40
		},
		{
			color: '#5cb87a',
			percentage: 60
		},
		{
			color: '#1989fa',
			percentage: 80
		},
		{
			color: '#6f7ad3',
			percentage: 100
		}
	]
	const props = withDefaults(defineProps<{ percentage: number | string }>(), { percentage: 10 })
	const emit = defineEmits(['onChange'])
	watch(
		() => props.percentage,
		() => {
			emit('onChange')
		}
	)
</script>

<template>
	<el-progress type="dashboard" :percentage="Number(props.percentage)" :color="colors" />
</template>
