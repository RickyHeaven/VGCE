<script setup lang="ts">
	import type { CSSProperties } from 'vue'

	const props = withDefaults(defineProps<{ size?: number | string }>(), { size: '' })

	const style = computed<CSSProperties>(() => {
		if (!props.size) {
			return {}
		}
		const size = typeof props.size === 'number' ? `${props.size}px` : props.size
		return { fontSize: size, width: size, height: size }
	})
</script>

<template>
	<i class="vgce-icon" :style="style"><slot /></i>
</template>

<style scoped lang="less">
	.vgce-icon {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		position: relative;
		fill: currentColor;
		width: 1em;
		height: 1em;
		font-size: inherit;
		font-style: normal;
		color: inherit;
		vertical-align: middle;

		:deep(svg) {
			width: 1em;
			height: 1em;
		}
	}
</style>