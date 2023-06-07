<script lang="ts" setup>
	import { ref } from 'vue'
	import { useGlobalStore } from '@/stores/global'
	import { ElTree } from 'element-plus'
	import { EGlobalStoreIntention, IDoneJson } from '@/stores/global/types'

	const global_store = useGlobalStore()
	const current_node_key = ref(global_store.handle_svg_info?.info.id || '')
	const handleNodeClick = (data: IDoneJson) => {
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
		:data="global_store.done_json"
		:props="defaultProps"
		@node-click="handleNodeClick"
		:default-expand-all="true"
		:expand-on-click-node="false"
		:highlight-current="true"
		node-key="id"
		:current-node-key="current_node_key"
	/>
</template>
