<script setup lang="ts">
	const props = withDefaults(defineProps<{ name: string; props?: Record<string, any> }>(), { props: () => ({}) })
	const symbolId = computed(() => `#svg-${props.name}`)
</script>
<template>
	<svg aria-hidden="true">
		<use :xlink:href="symbolId" v-bind="props.props" />
	</svg>
</template>
