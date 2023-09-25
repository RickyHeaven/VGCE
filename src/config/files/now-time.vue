<script setup lang="ts">
	const props = defineProps({
		fontColor: {
			type: String,
			default: '#000000'
		}
	})
	const now_date = ref(new Date())
	const timer = ref()
	const date = computed(() => {
		const year = now_date.value.getFullYear()
		const month = now_date.value.getMonth() + 1
		const day = now_date.value.getDate()
		return year.toString() + '年' + month.toString() + '月' + day.toString() + '日'
	})
	const week = computed(() => {
		const d = now_date.value.getDay()
		const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
		return weekday[d]
	})
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
	<div class="now-time">
		<div class="text-12px font-bold" :style="{ color: props.fontColor }">{{ date }}</div>
		<div class="flex mt-5px">
			<div class="text-12px font-bold" :style="{ color: props.fontColor }">{{ week }}</div>
			<div class="text-12px font-bold ml-5px" :style="{ color: props.fontColor }">{{ time }}</div>
		</div>
	</div>
</template>
<style scoped>
	.now-time {
		min-height: 40px;
		min-width: 100px;
	}
</style>
