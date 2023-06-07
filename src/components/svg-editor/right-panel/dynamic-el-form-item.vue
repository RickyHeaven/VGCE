<script setup lang="ts">
	import { EConfigItemPropsType } from '@/config-center/types'
	import type { IConfigItemProps } from '@/config-center/types'
	import { ElFormItem, ElColorPicker, ElInputNumber, ElInput, ElSelect, ElOption, ElSwitch } from 'element-plus'
	import JsonEdit from '@/components/svg-editor/right-panel/json-edit.vue'

	const props = withDefaults(defineProps<{ objInfo?: IConfigItemProps; hide?: string[] }>(), {
		objInfo: () => ({}),
		hide: () => []
	})
	const updateAttrItemVal = (
		attr_item: {
			title: string
			type: EConfigItemPropsType
			val: any
			options?: any
			disabled?: boolean | undefined
		},
		val: any
	) => {
		attr_item.val = val
	}
</script>

<template>
	<el-form-item
		v-for="(attr_item, key) in props.objInfo"
		:key="key"
		:label="attr_item.title"
		size="small"
		v-if="props.hide.indexOf(key) < 0"
	>
		<el-select
			v-if="attr_item.type === EConfigItemPropsType.Select"
			v-model="attr_item.val"
			placeholder="Select"
			size="small"
			:disabled="Boolean(attr_item?.disabled)"
		>
			<el-option v-for="item in attr_item.options" :key="item.value" :label="item.label" :value="item.value" />
		</el-select>
		<el-input-number
			v-else-if="attr_item.type === EConfigItemPropsType.InputNumber"
			v-model="attr_item.val"
			:disabled="Boolean(attr_item?.disabled)"
		></el-input-number>
		<el-input
			v-else-if="attr_item.type === EConfigItemPropsType.Input"
			v-model="attr_item.val"
			:disabled="Boolean(attr_item?.disabled)"
		></el-input>
		<el-color-picker
			v-else-if="attr_item.type === EConfigItemPropsType.Color"
			v-model="attr_item.val"
			:disabled="Boolean(attr_item?.disabled)"
		></el-color-picker>
		<el-switch
			v-else-if="attr_item.type === EConfigItemPropsType.Switch"
			v-model="attr_item.val"
			:disabled="Boolean(attr_item?.disabled)"
		></el-switch>
		<json-edit
			v-else-if="attr_item.type === EConfigItemPropsType.JsonEdit"
			:content-obj="attr_item.val"
			:disabled="Boolean(attr_item?.disabled)"
			@update-attr-item-val="(val) => updateAttrItemVal(attr_item, val)"
		></json-edit>
	</el-form-item>
</template>
