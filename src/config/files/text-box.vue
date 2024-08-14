<script setup lang="ts">
	import { computed } from 'vue'

	const props = withDefaults(
		defineProps<{
			width: number
			height: number
			bgColor: string
			bgOpacity: number
			borderColor: string
			borderWidth: number
			borderRadius: number
			borderOpacity: number
		}>(),
		{
			width: 250,
			height: 150,
			bgColor: '#ffffff',
			bgOpacity: 50,
			borderColor: '#000000',
			borderWidth: 1,
			borderRadius: 5,
			borderOpacity: 100
		}
	)
	const styleOut = computed(() => {
		return {
			width: (props.width > 0 ? props.width : 0) + 'px',
			height: (props.height > 0 ? props.height : 0) + 'px',
			borderRadius: (props.borderRadius > 0 ? props.borderRadius : 0) + 'px'
		}
	})
	const styleBorder = computed(() => {
		return {
			border: `${props.borderWidth > 0 ? props.borderWidth : 0}px solid ${props.borderColor}`,
			borderRadius: (props.borderRadius > 0 ? props.borderRadius : 0) + 'px',
			opacity: (props.borderOpacity > 0 ? (props.borderOpacity < 100 ? props.borderOpacity : 100) : 0) / 100
		}
	})
	const styleM = computed(() => {
		return {
			backgroundColor: props.bgColor,
			opacity: (props.bgOpacity > 0 ? (props.bgOpacity < 100 ? props.bgOpacity : 100) : 0) / 100,
			borderRadius: props.borderRadius + 'px'
		}
	})
</script>

<template>
	<div class="outM" :style="styleOut">
		<div class="wallI" :style="styleM"></div>
		<div class="borderB" :style="styleBorder"></div>
	</div>
</template>

<style scoped lang="less">
	.outM {
		position: relative;
	}

	.borderB,
	.wallI {
		height: 100%;
	}

	.borderB {
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
	}
</style>
