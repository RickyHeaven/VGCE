<script lang="ts" setup>
	import { ELineBindAnchors } from '@/components/config/types'
	import { useGlobalStore } from '@/stores/global'
	import { pinia } from '@/hooks'
	import { EDoneJsonType } from '@/config/types'
	import { ElFormItem, ElSwitch, ElSelect, ElOption, ElInputNumber } from 'element-plus'
	import { moveAnchors, setSvgActualInfo } from '@/utils'

	const globalStore = useGlobalStore(pinia)

	const emit = defineEmits(['update:modelValue'])
	const props = defineProps<{ modelValue?: { target_id: string; type: ELineBindAnchors } | null; title: string }>()

	const switchValue = computed({
		get() {
			return props.modelValue !== null
		},
		set(v: boolean) {
			let t: any = null
			if (v) {
				t = {
					target_id: '',
					type: ''
				}
			}
			emit('update:modelValue', t)
		}
	})

	const _targetId = computed({
		get() {
			return props.modelValue?.target_id ?? undefined
		},
		set(v) {
			let t: any = null
			if (switchValue.value) {
				t = {
					target_id: v,
					type: _type.value
				}
			}
			emit('update:modelValue', t)
		}
	})

	const _type = computed({
		get() {
			return props.modelValue?.type ?? undefined
		},
		set(v) {
			let t: any = null
			if (switchValue.value) {
				t = {
					target_id: _targetId.value,
					type: v
				}
			}
			emit('update:modelValue', t)
		}
	})

	const _targets = computed(() =>
		globalStore.done_json
			.filter((e: Record<string, any>) => e.type !== EDoneJsonType.ConnectionLine)
			.map((e: Record<string, any>) => ({
				label: e.title,
				value: e.id
			}))
	)

	const _types = [
		{
			label: '上锚点',
			value: ELineBindAnchors.TopCenter
		},
		{
			label: '右锚点',
			value: ELineBindAnchors.Right
		},
		{
			label: '下锚点',
			value: ELineBindAnchors.BottomCenter
		},
		{
			label: '左锚点',
			value: ELineBindAnchors.Left
		}
	]

	function changHandle() {
		nextTick(function () {
			if (switchValue.value && props.modelValue?.target_id && props.modelValue?.type && globalStore.handle_svg_info) {
				let done_json: any = null
				for (let e of globalStore.done_json) {
					if (e.id === props.modelValue.target_id) {
						done_json = e
					}
				}
				if (done_json) {
					setSvgActualInfo(done_json)
					moveAnchors(done_json)
				}
			}
		})
	}
</script>

<template>
	<el-form-item :label="props.title" size="small">
		<el-switch v-model="switchValue" @change="changHandle" />
	</el-form-item>
	<el-form-item label="绑定对象" size="small" v-if="switchValue">
		<el-select v-model="_targetId" @change="changHandle">
			<el-option v-for="t of _targets" :key="t.value" :label="t.label" :value="t.value" />
		</el-select>
	</el-form-item>
	<el-form-item label="绑定位置" size="small" v-if="switchValue">
		<el-select v-model="_type" @change="changHandle">
			<el-option v-for="t of _types" :key="t.value" :label="t.label" :value="t.value" />
		</el-select>
	</el-form-item>
</template>

<style lang="less" scoped></style>
