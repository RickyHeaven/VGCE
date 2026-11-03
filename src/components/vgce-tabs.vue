<script setup lang="ts">
	type IPane = { name: string; label: string; uid: number }

	const props = withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: '' })
	const emit = defineEmits(['update:modelValue', 'tabChange'])

	const active = ref(props.modelValue)
	const panes = ref<IPane[]>([])
	let seed = 0

	const register = (pane: { name: string; label: string }) => {
		const uid = seed++
		panes.value.push({ ...pane, uid })
		if (!active.value) {
			active.value = pane.name
			emit('update:modelValue', pane.name)
		}
		return uid
	}
	const unregister = (uid: number) => {
		panes.value = panes.value.filter((p) => p.uid !== uid)
	}
	const updateLabel = (uid: number, label: string) => {
		const pane = panes.value.find((p) => p.uid === uid)
		if (pane) {
			pane.label = label
		}
	}
	const select = (name: string) => {
		if (name === active.value) {
			return
		}
		active.value = name
		emit('update:modelValue', name)
		emit('tabChange', name)
	}

	watch(
		() => props.modelValue,
		(val) => {
			active.value = val
		}
	)

	provide('vgceTabs', { active, register, unregister, updateLabel })
</script>

<template>
	<div class="vgce-tabs">
		<div class="vgce-tabs__nav">
			<div
				v-for="pane in panes"
				:key="pane.uid"
				class="vgce-tabs__item"
				:class="{ 'vgce-tabs__item--active': pane.name === active }"
				@click="select(pane.name)"
			>
				{{ pane.label }}
			</div>
		</div>
		<div class="vgce-tabs__content">
			<slot />
		</div>
	</div>
</template>

<style scoped lang="less">
	.vgce-tabs {
		display: block;

		&__nav {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			border-bottom: 1px solid #e4e7ed;
		}

		&__item {
			position: relative;
			height: 32px;
			line-height: 32px;
			padding: 0 12px;
			font-size: 13px;
			white-space: nowrap;
			color: #303133;
			cursor: pointer;
			user-select: none;
			transition: color 0.2s;

			&:hover {
				color: #409eff;
			}

			&--active {
				color: #409eff;

				&::after {
					content: '';
					position: absolute;
					left: 0;
					right: 0;
					bottom: -1px;
					height: 2px;
					background: #409eff;
				}
			}
		}

		&__content {
			width: 100%;
		}
	}
</style>