<script setup lang="ts">
	const props = withDefaults(defineProps<{ type?: string; closable?: boolean; disableTransitions?: boolean }>(), {
		type: 'primary',
		closable: false,
		disableTransitions: false
	})
	const emit = defineEmits(['close'])
</script>

<template>
	<span class="vgce-tag" :class="`vgce-tag--${props.type}`">
		<slot />
		<span v-if="props.closable" class="vgce-tag__close" @click.stop="emit('close')">×</span>
	</span>
</template>