<script setup lang="ts">
	const props = defineProps<{ label: string; name: string }>()

	const ctx = inject<any>('vgceTabs')

	const uid = ctx?.register({ name: props.name, label: props.label })
	watch(
		() => props.label,
		(val) => {
			if (uid !== undefined) {
				ctx?.updateLabel(uid, val)
			}
		}
	)
	onUnmounted(() => {
		if (uid !== undefined) {
			ctx?.unregister(uid)
		}
	})

	const isActive = computed(() => ctx?.active.value === props.name)
</script>

<template>
	<div v-if="isActive" class="vgce-tab-pane">
		<slot />
	</div>
</template>

<style scoped lang="less">
	.vgce-tab-pane {
		width: 100%;
	}
</style>