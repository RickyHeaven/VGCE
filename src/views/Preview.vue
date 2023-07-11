<script setup lang="ts">
	import SvgViewer from '@/components/svg-viewer/index.vue'
	import { useStore } from '@/stores/main'

	const store = useStore()
</script>

<template>
	<svg-viewer :data="store.data" />
</template>

<style lang="less" scoped></style>
