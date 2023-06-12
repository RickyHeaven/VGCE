<!--左侧工具栏-->
<script lang="ts" setup>
  import {PropType, ref} from 'vue'
  import {ElCollapse, ElCollapseItem, ElIcon, ElMessage} from 'element-plus'
  import {IConfigCenter, IConfigItem} from '@/config-center/types'
  import {useGlobalStore} from '@/stores/global'
  import SvgAnalysis from '@/components/svg-analysis/index.vue'
  import {EGlobalStoreIntention} from '@/stores/global/types'
  import {prosToVBind} from '@/utils'

  const globalStore = useGlobalStore()
  const props = defineProps({
    customToolBar: {
      type: Object as PropType<IConfigCenter>,
      default: () => {
      }
    }
  })
  const left_tool_bar = ref(props.customToolBar && Object.keys(props.customToolBar).length > 0 ? props.customToolBar :
    globalStore.config_center)
  const activeNames = ref([
    'stateful', 'stateless', 'have_animation', 'custom_svg_group', 'element-ui', 'custom-vue', 'echarts'
  ])
  const createBegin = (svg_item: IConfigItem) => {
    globalStore.setCreateInfo(Object.assign(svg_item, {events: []}))
  }
  const dragEndEvent = (e: DragEvent) => {
    //拖动时记录拖动的svg信息
    if (e.dataTransfer?.dropEffect !== 'copy') {
      ElMessage.warning('请将组件拖到画布中!')
      //清空已选择的信息
      globalStore.intention = EGlobalStoreIntention.None
      return
    }
  }
</script>
<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item :name="item.groupType"  v-for="item of left_tool_bar" :key="item.title">
        <template #title>
          <div style="font-weight: bold">{{ item.title }}</div>
        </template>
        <div class="component-group flex flex-wrap">
          <div
              v-for="svg_item in item.list"
              class="ideal"
              :key="svg_item.name"
              draggable="true"
              @dragstart="createBegin(svg_item)"
              @dragend="dragEndEvent"
          >
            <div class="flex component-item items-center ml-10px">
              <el-icon :size="40" class="flex items-center">
                <svg-analysis :name="svg_item.name" :props="prosToVBind(svg_item)"/>
              </el-icon>
              <div>{{ svg_item.title }}</div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped lang="less">
  .component-item {
    width: 110px;
    height: 30px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    box-sizing: border-box;
    overflow: hidden;
    margin-bottom: 5px;

    &:hover {
      cursor: move;
      // outline: 1px solid #409eff;
      box-shadow: 0 4px 16px rgb(0 0 0 / 10%);
    }
  }

  .source-repo {
    min-width: 60px;
    font-weight: bolder;
    font-style: italic;
    font-size: 15px;
  }
</style>
