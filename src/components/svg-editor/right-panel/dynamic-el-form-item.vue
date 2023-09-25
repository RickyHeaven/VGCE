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

	const emit = defineEmits(['change'])
	const props = withDefaults(defineProps<{ objInfo?: IConfigItemProps; hide?: string[]; code?: boolean }>(), {
		objInfo: () => ({}),
		hide: () => [],
		code: false
	})

	function propsChangeHandle(e: any) {
		/*let t: any = window.setTimeout(function () {
			emit('change', e)
			clearTimeout(t)
			t = null
		}, 200)*/
	}
</script>

<template>
	<div v-for="(attr_item, key) in props.objInfo" :key="key">
		<!--表单项上显示的灰色值-->
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
				:content="JSON.stringify(attr_item.val)"
				v-if="getStringWidth(String(attr_item.val)) > 145"
				placement="left"
				popper-class="props-popper"
			>
				<div class="one-row-txt" style="width: 145px">{{ attr_item.val }}</div>
			</el-tooltip>
			<span v-else>{{ attr_item.val }}</span>
		</el-form-item>
		<!--props-->
		<el-form-item :label="attr_item.title" size="small" v-if="props.hide.indexOf(String(key)) < 0">
			<el-select
				v-if="attr_item.type === EConfigItemPropsType.Select"
				v-model="attr_item.val"
				placeholder="Select"
				size="small"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			>
				<el-option v-for="item in attr_item.options" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
			<el-input-number
				v-else-if="attr_item.type === EConfigItemPropsType.InputNumber"
				v-model="attr_item.val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<el-input
				v-else-if="attr_item.type === EConfigItemPropsType.Input"
				v-model="attr_item.val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<el-input
				v-else-if="attr_item.type === EConfigItemPropsType.Textarea"
				v-model="attr_item.val"
				autosize
				type="textarea"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<el-color-picker
				v-else-if="attr_item.type === EConfigItemPropsType.Color"
				v-model="attr_item.val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<el-switch
				v-else-if="attr_item.type === EConfigItemPropsType.Switch"
				v-model="attr_item.val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<code-edit-modal
				v-else-if="attr_item.type === EConfigItemPropsType.JsonEdit"
				v-model="attr_item.val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
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
	sdf {
		color: rgb(245, 247, 250);
		background-color: rgb(92, 184, 122);
	}
</style>
