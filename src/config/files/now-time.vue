<script setup lang="ts">
	import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
	import { configLocaleKey, formatConfigDate, getConfigWeekday } from '../i18n'

	const props = defineProps<{
		width: number
		fontFamily: string
		color: string
		fontSize: number
		bold: boolean
	}>()

	const styles = computed(() => ({
		fontFamily: props.fontFamily,
		color: props.color,
		fontSize: props.fontSize + 'px',
		fontWeight: props.bold ? 'bold' : 'normal'
	}))

	const locale = inject(configLocaleKey, ref('zh-CN'))
	const now_date = ref(new Date())
	const timer = ref()
	const date = computed(() => formatConfigDate(now_date.value, locale.value))
	const week = computed(() => getConfigWeekday(now_date.value, locale.value))
	const time = computed(() => {
		const hour = now_date.value.getHours()
		const minute = now_date.value.getMinutes()
		const second = now_date.value.getSeconds()
		return (
			(hour < 10 ? '0' + hour.toString() : hour.toString()) +
			':' +
			(minute < 10 ? '0' + minute.toString() : minute.toString()) +
			':' +
			(second < 10 ? '0' + second.toString() : second.toString())
		)
	})

	onMounted(() => {
		timer.value = setInterval(() => {
			now_date.value = new Date() // 修改数据date
		}, 500)
	})
	onUnmounted(() => {
		clearInterval(timer.value)
	})
</script>
<template>
	<div class="now-time" :style="{ width: props.width + 'px' }">
		<div :style="styles">{{ date }}</div>
		<div class="row">
			<div :style="styles">{{ week }}</div>
			<div :style="styles">{{ time }}</div>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.now-time {
		min-height: 40px;
		min-width: 100px;
		color: #c54e6a;

		.row {
			display: flex;
			justify-content: space-between;
			margin-top: 5px;
		}
	}
</style>