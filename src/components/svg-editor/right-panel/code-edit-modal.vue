<script setup lang="ts">
	import { VAceEditor } from 'vue3-ace-editor'
	import '@/components/ace-edit'
	import { ElDialog } from 'element-plus'
	import { translate } from '@/i18n'

	const props = withDefaults(defineProps<{ modelValue?: any; lang?: string; title?: string }>(), {
		modelValue: () => ({}),
		lang: 'json'
	})
	const dialog_title = computed(() => props.title || translate('编辑'))
	const open = ref(false)
	const emits = defineEmits(['update:modelValue', 'close'])

	const content = computed({
		get() {
			if (props.lang === 'json') {
				return JSON.stringify(props.modelValue, null, 2)
			}
			return props.modelValue
		},
		set(val) {
			if (props.lang === 'json') {
				emits('update:modelValue', JSON.parse(val))
			} else {
				emits('update:modelValue', val)
			}
		}
	})
</script>

<template>
	<div>
		<button type="button" class="vgce-btn vgce-btn--sm" @click="open = true">···</button>
		<el-dialog class="modal-full" v-model="open" :title="dialog_title" width="60%" @close="emits('close')">
			<v-ace-editor
				v-model:value="content"
				:lang="props.lang"
				theme="kr_theme"
				style="height: 400px"
				:options="{
					useWorker: true
				}"
			/>
		</el-dialog>
	</div>
</template>