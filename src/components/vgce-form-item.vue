<script setup lang="ts">
	import { ElFormItem } from 'element-plus'
	import VgceEllipsis from '@/components/vgce-ellipsis.vue'

	const props = withDefaults(defineProps<{ label?: string; labelWidth?: number; labelFontSize?: number }>(), {
		label: '',
		labelWidth: 96,
		labelFontSize: 12
	})
</script>

<template>
	<el-form-item>
		<template #label v-if="label">
			<vgce-ellipsis :text="label" :width="labelWidth" :font-size="labelFontSize" />
		</template>
		<slot />
		<template #error="scope" v-if="$slots.error">
			<slot name="error" v-bind="scope" />
		</template>
	</el-form-item>
</template>