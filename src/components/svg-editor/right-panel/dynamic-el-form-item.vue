<script setup lang="ts">
	import { EConfigItemPropsType } from '@/config/types'
	import type { IConfigItemProps } from '@/config/types'
	import {
		ElFormItem,
		ElColorPicker,
		ElInputNumber,
		ElInput,
		ElSelect,
		ElOption,
		ElSwitch,
		ElTooltip
	} from 'element-plus'
	import { getStringWidth } from '@/utils'
	import CodeEditModal from '@/components/svg-editor/right-panel/code-edit-modal.vue'

	const props = withDefaults(defineProps<{ objInfo?: IConfigItemProps; hide?: string[]; code?: boolean }>(), {
		objInfo: () => ({}),
		hide: () => [],
		code: false
	})
</script>

<template>
	<div v-for="(attr_item, key) in props.objInfo" :key="key">
		<el-form-item v-if="props.code" class="props-row" size="small">
			<template #label>
				<el-tooltip
					:content="String(key)"
					v-if="getStringWidth(String(key)) > 78"
					placement="left"
					popper-class="props-popper"
				>
					<div class="one-row-txt" style="width: 78px">{{ key }}</div>
				</el-tooltip>
				<span v-else>{{ key }}</span>
			</template>
			<el-tooltip
				:content="attr_item.val"
				v-if="getStringWidth(String(attr_item.val)) > 145"
				placement="left"
				popper-class="props-popper"
			>
				<div class="one-row-txt" style="width: 145px">{{ attr_item.val }}</div>
			</el-tooltip>
			<span v-else>{{ attr_item.val }}</span>
		</el-form-item>
		<el-form-item :label="attr_item.title" size="small" v-if="props.hide.indexOf(String(key)) < 0">
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
			<code-edit-modal
				v-else-if="attr_item.type === EConfigItemPropsType.JsonEdit"
				v-model="attr_item.val"
				:disabled="Boolean(attr_item?.disabled)"
			/>
		</el-form-item>
	</div>
</template>
<style lang="less" scoped>
	.one-row-txt {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
<style lang="less">
	.props-popper {
		max-width: 350px;
	}
</style>
