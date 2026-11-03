<script setup lang="ts">
	import { ElDrawer } from 'element-plus'
	import VgceIcon from '@/components/vgce-icon.vue'
	import VgceTag from '@/components/vgce-tag.vue'
	import VgceTabs from '@/components/vgce-tabs.vue'
	import VgceTabPane from '@/components/vgce-tab-pane.vue'
	import { common_animate_list } from '@/components/config'
	import SvgAnalysis from '@/components/svg-analysis.vue'
	import { translate } from '@/i18n'

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
		<vgce-tag closable v-if="select_val" @close="addAnimation('')" @click="drawer_visible = true" style="cursor: pointer"
			>{{
				translate(
					common_animate_list
						.map((m) => m.children)
						.reduce((pre, curr) => {
							return pre.concat(curr)
						})
						.find((f) => f.value == select_val)?.label
				)
			}}
			<vgce-icon :size="10">
				<svg-analysis name="setting" />
			</vgce-icon>
		</vgce-tag>
		<vgce-tag v-else type="success" style="cursor: pointer" @click="drawer_visible = true">{{ translate('新增') }}</vgce-tag>
		<el-drawer v-model="drawer_visible" :title="translate('选择动画')" direction="ltr">
			<vgce-tabs v-model="activeName">
				<vgce-tab-pane
					:label="translate(tab_item.label)"
					:name="tab_item.label"
					v-for="tab_item in common_animate_list"
					:key="tab_item.label"
				>
					<div class="vgce-scrollbar" style="height: 500px">
						<div class="flex flex-wrap">
							<div
								class="animate"
								v-for="(animate, index) in tab_item.children"
								:key="index"
								:title="translate(animate.label)"
								@mouseenter="play_index = index"
								@mouseleave="play_index = null"
								@click="addAnimation(animate.value)"
							>
								<div
									:class="`animate__inner ${
										play_index == index
											? `animate__animated animate__${animate.value} animate__slow animate__infinite`
											: ''
									}`"
								>
									<span class="animate__text">{{ translate(animate.label) }}</span>
								</div>
							</div>
						</div>
					</div>
				</vgce-tab-pane>
			</vgce-tabs>
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
		padding: 6px 5px;
		box-sizing: border-box;
		font-size: 12px;
		line-height: 15px;
		color: #333;
		border-radius: 3px;
		user-select: none;
		cursor: pointer;
		overflow: hidden;
	}

	.animate__inner {
		width: 100%;
	}

	.animate__text {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		width: 100%;
		overflow: hidden;
		text-align: center;
		word-break: break-word;
		overflow-wrap: anywhere;
	}
</style>