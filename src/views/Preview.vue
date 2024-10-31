<script setup lang="ts">
	import SvgViewer from '@/components/svg-viewer.vue'
	import { ElButton } from 'element-plus'
	import { ArrowLeftBold } from '@element-plus/icons-vue'
	import { useStore } from '@/stores/main'

	const emit = defineEmits(['back'])
	const store = useStore()

	function back() {
		emit('back')
	}
</script>

<template>
	<div class="previewPage">
		<svg-viewer :data="store.data" />
		<el-button link @click="back" class="backBtn" :icon="ArrowLeftBold">返回</el-button>
	</div>
</template>

<style lang="less" scoped>
	.previewPage {
		position: fixed;
		z-index: 1000;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;

		.backBtn {
			position: absolute;
			top: 20px;
			right: 30px;
			z-index: 100;
		}
	}
</style>
