<script setup lang="ts">
	import { EConfigItemPropsType } from '@/config/types'
	import type { IConfigItemProps } from '@/config/types'
	import {
		ElFormItem,
		ElInputNumber,
		ElInput,
		ElSelect,
		ElSwitch
	} from 'element-plus'
	import VgceColorPicker from '@/components/vgce-color-picker.vue'
	import VgceEllipsis from '@/components/vgce-ellipsis.vue'
	import VgceFormItem from '@/components/vgce-form-item.vue'
	import VgceOption from '@/components/vgce-option.vue'
	import CodeEditModal from '@/components/svg-editor/right-panel/code-edit-modal.vue'
	import { translate } from '@/i18n'

	const emit = defineEmits(['change'])
	const props = withDefaults(defineProps<{ objInfo?: IConfigItemProps; hide?: string[]; code?: boolean }>(), {
		objInfo: () => ({}),
		hide: () => [],
		code: false
	})

	const _objInfo = computed(() => {
		const keys: Record<string, any> = {}
		let l = 0
		let t = []
		const list = Object.keys(props.objInfo)
		if (!list.length) {
			return []
		}
		for (let k of list) {
			const s = props.objInfo[k]?.sort
			if (s) {
				const _s = Number(s)
				if (_s > l) {
					l = _s
				}
			}
			if (s) {
				keys[s] = k
			} else {
				return Object.keys(props.objInfo).map((k) => ({
					...props.objInfo[k],
					_key: k
				}))
			}
		}

		for (let i = 0; i < l + 1; i++) {
			const _i = String(i)
			if (!keys[_i]) {
				continue
			}
			t.push({
				...props.objInfo[keys[_i]],
				_key: keys[_i]
			})
		}
		return t
	})

	function valToString(val: any) {
		if (val === null || val === undefined) {
			return ''
		}
		if (typeof val === 'object') {
			return JSON.stringify(val)
		}
		return String(val)
	}

	function propsChangeHandle(e: any) {
		let t: any = window.setTimeout(function () {
			emit('change', e)
			clearTimeout(t)
			t = null
		}, 200)
	}
</script>

<template>
	<div v-for="attr_item in _objInfo" :key="attr_item._key">
		<!--表单项上显示的灰色值-->
		<el-form-item v-if="props.code" class="props-row" size="small">
			<template #label>
				<vgce-ellipsis :text="String(attr_item._key)" :width="78" :font-size="12" />
			</template>
			<vgce-ellipsis :text="valToString(attr_item.val)" :width="145" :font-size="12" />
		</el-form-item>
		<!--props-->
		<vgce-form-item :label="translate(attr_item.title)" size="small" v-if="props.hide.indexOf(String(attr_item._key)) < 0">
			<el-select
				v-if="attr_item.type === EConfigItemPropsType.Select"
				v-model="props.objInfo[attr_item._key].val"
				placeholder="Select"
				size="small"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			>
				<vgce-option v-for="item in attr_item.options" :key="item.value" :label="translate(item.label)" :value="item.value" />
			</el-select>
			<el-input-number
				v-else-if="attr_item.type === EConfigItemPropsType.InputNumber"
				v-model="props.objInfo[attr_item._key].val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<el-input
				v-else-if="attr_item.type === EConfigItemPropsType.Input"
				v-model="props.objInfo[attr_item._key].val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<el-input
				v-else-if="attr_item.type === EConfigItemPropsType.Textarea"
				v-model="props.objInfo[attr_item._key].val"
				autosize
				type="textarea"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<vgce-color-picker
				v-else-if="attr_item.type === EConfigItemPropsType.Color"
				v-model="props.objInfo[attr_item._key].val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<el-switch
				v-else-if="attr_item.type === EConfigItemPropsType.Switch"
				v-model="props.objInfo[attr_item._key].val"
				:disabled="Boolean(attr_item?.disabled)"
				@change="propsChangeHandle"
			/>
			<code-edit-modal
				v-else-if="attr_item.type === EConfigItemPropsType.JsonEdit"
				v-model="props.objInfo[attr_item._key].val"
				:disabled="Boolean(attr_item?.disabled)"
				@close="propsChangeHandle"
			/>
		</vgce-form-item>
	</div>
</template>