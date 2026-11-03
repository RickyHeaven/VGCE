<script setup lang="ts">
	import { ElTooltip } from 'element-plus'
	import { getStringWidth } from '@/utils'

	const props = withDefaults(
		defineProps<{
			text?: string | number
			width?: number
			fontSize?: number
			placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'
		}>(),
		{
			text: '',
			width: 96,
			fontSize: 14,
			placement: 'left'
		}
	)

	const content = computed(() => String(props.text ?? ''))

	const width_cache = new Map<string, number>()
	function measureWidth(text: string, fontSize: number) {
		const key = `${fontSize}:${text}`
		let width = width_cache.get(key)
		if (width === undefined) {
			width = getStringWidth(text, fontSize)
			width_cache.set(key, width)
		}
		return width
	}

	const overflow = computed(() => measureWidth(content.value, props.fontSize) > props.width)
</script>

<template>
	<el-tooltip :content="content" :disabled="!overflow" :placement="placement" popper-class="vgce-ellipsis-popper" :persistent="false">
		<span
			class="vgce-ellipsis"
			:class="{ 'vgce-ellipsis--clamp': overflow }"
			:style="overflow ? { maxWidth: `${width}px` } : undefined"
			>{{ content }}</span
		>
	</el-tooltip>
</template>

<style lang="less" scoped>
	.vgce-ellipsis {
		display: inline-block;
		max-width: 100%;
		vertical-align: middle;

		&--clamp {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
</style>

<style lang="less">
	.vgce-ellipsis-popper {
		max-width: 320px;
		word-break: break-word;
	}
</style>