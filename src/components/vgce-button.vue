<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			type?: string
			size?: string
			plain?: boolean
			text?: boolean
			disabled?: boolean
		}>(),
		{
			type: 'primary',
			size: 'default',
			plain: false,
			text: false,
			disabled: false
		}
	)

	defineEmits(['onChange'])

	const btnClass = computed(() => {
		const type = props.type || 'default'
		return [
			`vgce-el-btn--${type}`,
			{
				'vgce-el-btn--lg': props.size === 'large',
				'vgce-el-btn--sm': props.size === 'small',
				'vgce-el-btn--plain': props.plain,
				'vgce-el-btn--text': props.text
			}
		]
	})
</script>

<template>
	<button class="vgce-el-btn" :class="btnClass" type="button" :disabled="props.disabled"><slot /></button>
</template>