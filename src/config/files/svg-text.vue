<script setup lang="ts">
	// 文字的内容决定了长度 所以没办法预先定义中心点 导致连线有偏移

	const emit = defineEmits(['resize'])
	const props = defineProps<{ text?: string; bold: boolean }>()
	watch(
		() => props.text,
		() => {
			nextTick(function () {
				emit('resize')
			})
		}
	)
</script>
<template>
	<text x="50" y="55" :style="{ 'font-weight': props.bold ? 'bold' : 'normal' }">{{ props.text }}</text>
</template>
