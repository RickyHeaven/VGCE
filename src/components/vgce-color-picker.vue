<script setup lang="ts">
	const props = withDefaults(defineProps<{ modelValue?: string; disabled?: boolean }>(), {
		modelValue: '',
		disabled: false
	})
	const emit = defineEmits(['update:modelValue', 'change'])

	const onInput = (e: Event) => {
		if (props.disabled) {
			return
		}
		const val = (e.target as HTMLInputElement).value
		emit('update:modelValue', val)
		emit('change', val)
	}
</script>

<template>
	<div class="vgce-color-picker" :class="{ 'vgce-color-picker--disabled': props.disabled }">
		<input
			class="vgce-color-picker__text"
			type="text"
			:value="props.modelValue"
			:disabled="props.disabled"
			@change="onInput"
		/>
		<label class="vgce-color-picker__swatch" :style="{ backgroundColor: props.modelValue || 'transparent' }">
			<input type="color" :value="props.modelValue || '#ffffff'" :disabled="props.disabled" @input="onInput" />
		</label>
	</div>
</template>

<style scoped lang="less">
	.vgce-color-picker {
		display: inline-flex;
		align-items: center;
		gap: 6px;

		&__text {
			width: 96px;
			height: 28px;
			padding: 0 8px;
			font-size: 12px;
			color: #606266;
			border: 1px solid #dcdfe6;
			border-radius: 4px;
			outline: none;
			transition: border-color 0.2s;

			&:focus {
				border-color: #409eff;
			}

			&:disabled {
				background: #f5f7fa;
				cursor: not-allowed;
			}
		}

		&__swatch {
			position: relative;
			display: inline-block;
			width: 28px;
			height: 28px;
			border: 1px solid #dcdfe6;
			border-radius: 4px;
			cursor: pointer;
			overflow: hidden;

			input {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				padding: 0;
				border: none;
				opacity: 0;
				cursor: pointer;
			}
		}

		&--disabled {
			opacity: 0.6;

			.vgce-color-picker__swatch {
				cursor: not-allowed;

				input {
					cursor: not-allowed;
				}
			}
		}
	}
</style>