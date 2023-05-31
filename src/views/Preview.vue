<script setup lang="ts">
	import WebtopoSvgPreview from '@/components/webtopo-svg-preview/index.vue'
	import { useStore } from '@/stores/main'

	const store = useStore()
</script>

<template>
	<webtopo-svg-preview :dataModel="store.dataModel" />
</template>

<style lang="less" scoped></style>
