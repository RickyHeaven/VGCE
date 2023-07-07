<script setup lang="ts">
	import type { IAttrItem } from '@/config-center/types'
	import { ElIcon, ElInput } from 'element-plus'
	import SvgAnalysis from '@/components/svg-analysis/index.vue'
	import { computed } from 'vue'

	const props = withDefaults(defineProps<{ modelValue: IAttrItem[] }>(), {
		modelValue: () => [
			{
				key: '',
				val: ''
			}
		]
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

	const addL = () => {
		value.value.push({
			key: '',
			val: ''
		})
	}

	const deleteL = (i: number) => {
		value.value.splice(i, 1)
	}
</script>

<template>
	<div class="wall-l">
		<div class="head-l">
			<span>key</span>
			<span>value</span>

			<el-icon :size="16" class="bt-Icon" @click="addL">
				<svg-analysis name="add" />
			</el-icon>
		</div>
		<div class="row-l" v-for="(item, i) of value">
			<el-input class="content-l" v-model="item.key" size="small" placeholder="key" />
			<el-input class="content-l" v-model="item.val" size="small" placeholder="value" />

			<el-icon :size="16" class="bt-Icon" @click="deleteL(i)">
				<svg-analysis name="delete" />
			</el-icon>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.wall-l {
		background-color: #f3f6f9;
		padding: 4px 5px 2px 5px;
		border-radius: 4px;
		.head-l {
			display: flex;
			align-items: center;

			span {
				display: inline-block;
				width: 42%;
				margin-right: 10px;
				color: #666;
			}
		}

		.row-l {
			display: flex;
			align-items: center;
			padding-bottom: 6px;
			.content-l {
				width: 42%;
				margin-right: 10px;
			}
		}
	}
</style>
