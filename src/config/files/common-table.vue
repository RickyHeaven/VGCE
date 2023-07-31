<template>
	<el-table v-bind="table_props">
		<el-table-column v-for="item in props.colConfig" :key="item.prop" v-bind="item"></el-table-column>
	</el-table>
</template>
<script setup lang="ts">
	import { ElTable, ElTableColumn } from 'element-plus'

	const props = withDefaults(
		defineProps<{
			colConfig: ICol[]
			data: any[]
			height: number
			maxHeight: number
			stripe: boolean
			border: boolean
			size: string
			fit: boolean
			operateDisplay: boolean
			selectionData: any[]
		}>(),
		{
			colConfig: () => [],
			data: () => [],
			stripe: false,
			border: false,
			fit: false,
			operateDisplay: false,
			selectionData: () => []
		}
	)
	const table_props = ref({})
	watchEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
<style scoped lang="scss"></style>
