<script setup lang="ts">
	import { computed } from 'vue'
	import { ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus/es'
	import type { ICondition } from '@/config-center/types'
	import { EConditionType } from '@/config-center/types'

	const props = withDefaults(defineProps<{ modelValue: ICondition }>(), {
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

	const re: { label: string; val: string }[] = [
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

	const typeChange = (d) => {
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
		<el-form-item label="条件" size="small">
			<el-select v-model="value.type" @change="typeChange">
				<el-option value="None" label="无" />
				<el-option value="Relation" label="关系运算" />
			</el-select>
		</el-form-item>
		<el-form-item label="属性" size="small" v-if="value.type === 'Relation'">
			<el-input v-model="value.Relation!.key" />
		</el-form-item>
		<el-form-item label="关系" size="small" v-if="value.type === 'Relation'">
			<el-select v-model="value.Relation!.relation">
				<el-option :value="e.val" :label="e.label" v-for="(e, i) of re" :key="'rop' + i" />
			</el-select>
		</el-form-item>
		<el-form-item label="值" size="small" v-if="value.type === 'Relation'">
			<el-input v-model="value.Relation!.val" />
		</el-form-item>
		<el-form-item
			label="值2"
			size="small"
			v-if="value.type === 'Relation' && (value.Relation?.relation === '>=,=<' || value.Relation?.relation === '<,>')"
		>
			<el-input v-model="value.Relation!.val2" />
		</el-form-item>
	</div>
</template>

<style lang="less" scoped>
	.c-wall-d {
		padding-top: 10px;
	}
</style>
