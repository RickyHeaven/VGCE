<script setup lang="ts">
	import { ElInput, ElSelect } from 'element-plus'
	import VgceFormItem from '@/components/vgce-form-item.vue'
	import VgceOption from '@/components/vgce-option.vue'
	import type { ICondition } from '@/config/types'
	import { EConditionType } from '@/config/types'
	import { translate } from '@/i18n'

	const props = withDefaults(defineProps<{ modelValue?: ICondition }>(), {
		modelValue: () => ({ type: EConditionType.None })
	})
	const emit = defineEmits(['update:modelValue'])
	const value = computed({
		get() {
			return props.modelValue
		},
		set(val) {
			emit('update:modelValue', val)
		}
	})

	const re: { label: string; val: any }[] = [
		{
			label: '大于',
			val: 'greater'
		},
		{
			label: '大于等于',
			val: '>='
		},
		{
			label: '小于',
			val: '<'
		},
		{
			label: '小于等于',
			val: '<='
		},
		{
			label: '等于',
			val: '=='
		},
		{
			label: '不等于',
			val: '!='
		},
		{
			label: '介于',
			val: '>=,=<'
		},
		{
			label: '不介于',
			val: '<,>'
		}
	]

	const typeChange = (d: string) => {
		if (d !== 'None') {
			value.value.Relation = {
				key: '',
				relation: '',
				val: '',
				val2: ''
			}
		}
		emit('update:modelValue', value)
	}
</script>

<template>
	<div class="c-wall-d">
		<vgce-form-item :label="translate('条件')" size="small">
			<el-select v-model="value.type" @change="typeChange">
				<vgce-option value="None" :label="translate('无')" />
				<vgce-option value="Relation" :label="translate('关系运算')" />
			</el-select>
		</vgce-form-item>
		<vgce-form-item :label="translate('属性')" size="small" v-if="value.type === 'Relation'">
			<el-input v-model="value.Relation!.key" />
		</vgce-form-item>
		<vgce-form-item :label="translate('关系')" size="small" v-if="value.type === 'Relation'">
			<el-select v-model="value.Relation!.relation">
				<vgce-option :value="e.val" :label="translate(e.label)" v-for="(e, i) of re" :key="'rop' + i" />
			</el-select>
		</vgce-form-item>
		<vgce-form-item :label="translate('值')" size="small" v-if="value.type === 'Relation'">
			<el-input v-model="value.Relation!.val" />
		</vgce-form-item>
		<vgce-form-item
			:label="translate('值2')"
			size="small"
			v-if="value.type === 'Relation' && (value.Relation?.relation === '>=,=<' || value.Relation?.relation === '<,>')"
		>
			<el-input v-model="value.Relation!.val2" />
		</vgce-form-item>
	</div>
</template>

<style lang="less" scoped>
	.c-wall-d {
		padding-top: 10px;
	}
</style>