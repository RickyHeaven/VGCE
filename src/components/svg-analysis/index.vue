<script setup lang="ts">
	import { computed } from 'vue'

	const props = withDefaults(defineProps<{ name: string; props?: object }>(), { props: () => ({}) })
	const symbolId = computed(() => `#svg-${props.name}`)
</script>
<template>
	<svg aria-hidden="true">
		<use :xlink:href="symbolId" v-bind="props.props" />
	</svg>
</template>
