<script setup lang="ts">
	import { ElTag, ElDrawer, ElTabs, ElTabPane, ElScrollbar, ElIcon } from 'element-plus'
	import { common_animate_list } from '@/components/config'
	import SvgAnalysis from '@/components/svg-analysis.vue'

	const props = defineProps<{ val: string }>()
	const emits = defineEmits(['updateCommonAniVal'])
	const select_val = ref(props.val)
	const drawer_visible = ref(false)
	const activeName = ref('进入')
	const play_index = ref<null | number>(null)
	const addAnimation = (val: string) => {
		emits('updateCommonAniVal', val)
		drawer_visible.value = false
	}
	watch(
		() => props.val,
		(new_val) => {
			select_val.value = new_val
		}
	)
</script>

<template>
	<div style="height: 100%">
		<el-tag closable v-if="select_val" @close="addAnimation('')" @click="drawer_visible = true" style="cursor: pointer"
			>{{
				common_animate_list
					.map((m) => m.children)
					.reduce((pre, curr) => {
						return pre.concat(curr)
					})
					.find((f) => f.value == select_val)?.label
			}}
			<el-icon :size="10">
				<svg-analysis name="setting" />
			</el-icon>
		</el-tag>
		<el-tag v-else type="success" style="cursor: pointer" @click="drawer_visible = true">新增</el-tag>
		<el-drawer v-model="drawer_visible" title="选择动画" direction="ltr">
			<el-tabs v-model="activeName">
				<el-tab-pane
					:label="tab_item.label"
					:name="tab_item.label"
					v-for="tab_item in common_animate_list"
					:key="tab_item.label"
				>
					<el-scrollbar height="500px">
						<div class="flex flex-wrap">
							<div
								class="animate"
								v-for="(animate, index) in tab_item.children"
								:key="index"
								@mouseenter="play_index = index"
								@mouseleave="play_index = null"
								@click="addAnimation(animate.value)"
							>
								<div
									:class="`${
										play_index == index
											? `animate__animated animate__${animate.value} animate__slow animate__infinite`
											: ''
									}`"
								>
									{{ animate.label }}
								</div>
							</div>
						</div>
					</el-scrollbar>
				</el-tab-pane>
			</el-tabs>
		</el-drawer>
	</div>
</template>

<style scoped>
	.animate {
		cursor: pointer;
	}

	.animate > div {
		width: 80px;
		height: 60px;
		background: #f5f8fb;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 12px 10px 12px;
		font-size: 12px;
		color: #333;
		border-radius: 3px;
		user-select: none;
		cursor: pointer;
	}
</style>
