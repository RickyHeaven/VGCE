<script setup lang="ts">
	import { ElOption } from 'element-plus'

	const props = withDefaults(defineProps<{ value: string | number | boolean; label?: string }>(), {
		label: ''
	})

	const text = computed(() => String(props.label ?? props.value))
</script>

<template>
	<el-option :value="value" :label="text">
		<span class="vgce-option-text" :title="text">{{ text }}</span>
	</el-option>
</template>

<style lang="less" scoped>
	.vgce-option-text {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>