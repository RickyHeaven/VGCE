<script lang="ts" setup>
	import { pinia } from '@/hooks'
	import { useGlobalStore } from '@/stores/global'
	import { ElTree } from 'element-plus'
	import { EGlobalStoreIntention } from '@/stores/global/types'
	import type { IDoneJson } from '@/stores/global/types'

	const global_store = useGlobalStore(pinia)
	const current_node_key = computed(() => global_store.handle_svg_info?.info.id ?? '')
	const handleNodeClick = (data: IDoneJson) => {
		for (let e of global_store.done_json) {
			e.selected = false
			e.old_position = { x: 0, y: 0 }
		}
		global_store.intention = EGlobalStoreIntention.Select
		global_store.setHandleSvgInfo(data)
	}

	const defaultProps = {
		children: 'children',
		label: 'title'
	}
</script>

<template>
	<el-tree
		class="tree-v"
		:data="global_store.done_json"
		:props="defaultProps"
		@node-click="handleNodeClick"
		:default-expand-all="true"
		:expand-on-click-node="false"
		:highlight-current="Boolean(current_node_key)"
		node-key="id"
		:current-node-key="current_node_key"
	/>
</template>
