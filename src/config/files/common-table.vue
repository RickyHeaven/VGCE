<script setup lang="ts">
	import { ElTable, ElTableColumn } from 'element-plus'

	const props = withDefaults(
		defineProps<{
			colConfig: ICol[]
			data: any[]
			height?: number
			maxHeight?: number
			stripe?: boolean
			border?: boolean
			size?: string
			fit?: boolean
			operateDisplay?: boolean
			selectionData?: any[]
		}>(),
		{
			colConfig: () => [],
			data: () => [],
			height: 200,
			stripe: false,
			border: false,
			fit: false,
			operateDisplay: false,
			selectionData: () => []
		}
	)
	const table_props = ref({})
	watchEffect(() => {
		const { colConfig, ...temp_props } = props
		table_props.value = temp_props
	})

	interface ICol {
		prop: string
		label: string
		width: string
		fixed: string | boolean
		sortable: boolean
		'show-overflow-tooltip': boolean
	}
</script>

<template>
	<el-table v-bind="table_props">
		<el-table-column v-for="item in props.colConfig" :key="item.prop" v-bind="item"></el-table-column>
	</el-table>
</template>
