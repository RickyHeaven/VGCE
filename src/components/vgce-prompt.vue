<script setup lang="ts">
	import { ElDialog } from 'element-plus'
	import { translate } from '@/i18n'

	type IPromptOptions = {
		title?: string
		message?: string
		inputValue?: string
		inputPattern?: RegExp
		inputErrorMessage?: string
		confirmButtonText?: string
		cancelButtonText?: string
	}

	const visible = ref(false)
	const options = ref<IPromptOptions>({})
	const value = ref('')
	const error_msg = ref('')
	const inputRef = ref<HTMLInputElement>()

	let resolve_fn: ((r: { value: string }) => void) | null = null
	let reject_fn: ((reason: string) => void) | null = null

	const open = (opts: IPromptOptions) => {
		options.value = opts
		value.value = opts.inputValue ?? ''
		error_msg.value = ''
		visible.value = true
		nextTick(() => inputRef.value?.focus())
		return new Promise<{ value: string }>((resolve, reject) => {
			resolve_fn = resolve
			reject_fn = reject
		})
	}

	const cancel = () => {
		visible.value = false
		reject_fn?.('cancel')
		resolve_fn = null
		reject_fn = null
	}

	/**
	 * 通过右上角关闭按钮、遮罩或ESC关闭时同样要结束挂起的Promise，
	 * 否则调用方会一直等待（confirm/cancel已清空回调，此处不会重复触发）
	 */
	const onDialogClose = () => {
		if (!resolve_fn) {
			return
		}
		reject_fn?.('close')
		resolve_fn = null
		reject_fn = null
	}

	const confirm = () => {
		const val = value.value
		if (!val.trim()) {
			error_msg.value = translate('请输入内容')
			return
		}
		if (options.value.inputPattern && !options.value.inputPattern.test(val)) {
			error_msg.value = options.value.inputErrorMessage || translate('输入内容格式不正确')
			return
		}
		visible.value = false
		resolve_fn?.({ value: val })
		resolve_fn = null
		reject_fn = null
	}

	defineExpose({ open })
</script>

<template>
	<el-dialog v-model="visible" :title="options.title" width="420px" append-to-body class="vgce-prompt-dialog" @close="onDialogClose">
		<div class="vgce-prompt">
			<div class="vgce-prompt__message">{{ options.message }}</div>
			<input ref="inputRef" class="vgce-prompt__input" type="text" v-model="value" @keyup.enter="confirm" />
			<div class="vgce-prompt__error" v-if="error_msg">{{ error_msg }}</div>
		</div>
		<template #footer>
			<button type="button" class="vgce-btn" @click="cancel">{{ options.cancelButtonText || translate('取消') }}</button>
			<button type="button" class="vgce-btn vgce-btn--primary" @click="confirm">{{ options.confirmButtonText || translate('确定') }}</button>
		</template>
	</el-dialog>
</template>

<style scoped lang="less">
	.vgce-prompt {
		&__message {
			font-size: 14px;
			color: #606266;
			margin-bottom: 10px;
		}

		&__input {
			width: 100%;
			height: 32px;
			padding: 0 10px;
			font-size: 13px;
			color: #606266;
			border: 1px solid #dcdfe6;
			border-radius: 4px;
			outline: none;
			transition: border-color 0.2s;

			&:focus {
				border-color: #409eff;
			}
		}

		&__error {
			margin-top: 6px;
			font-size: 12px;
			color: #f56c6c;
		}
	}
</style>