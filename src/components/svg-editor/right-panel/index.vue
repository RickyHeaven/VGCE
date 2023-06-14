<script setup lang="ts">
  import {
    ElForm,
    ElFormItem,
    ElColorPicker,
    ElInputNumber,
    ElTabs,
    ElTabPane,
    ElIcon,
    ElInput,
    ElSwitch,
    ElSelect,
    ElOption,
    ElCollapseItem,
    ElCollapse
  } from 'element-plus'
  import {ref} from 'vue'
  import {useConfigStore} from '@/stores/config'
  import {useGlobalStore} from '@/stores/global'
  import {numberArray} from '@/utils'
  import {EGlobalStoreIntention, IDoneJson} from '@/stores/global/types'
  import {EEventType} from "@/config-center/types"
  import DynamicElFormItem from './dynamic-el-form-item.vue'
  import CommonAnimate from './common-animate.vue'
  import ComponentTree from '@/components/svg-editor/component-tree/index.vue'
  import SvgAnalysis from "@/components/svg-analysis/index.vue"
  import List from "@/components/svg-editor/right-panel/list.vue"
  import Condition from "@/components/svg-editor/right-panel/condition.vue"

  const configStore = useConfigStore()
  const globalStore = useGlobalStore()

  const activeName = ref('page')
  const activeNameB = ref('style')

  const updateCommonAniVal = (item: IDoneJson | undefined, val: string) => {
    if (item?.common_animations) {
      item.common_animations.val = val
    }
  }

  configStore.$subscribe((mutation, state) => {
    console.log(mutation)
    if (mutation.storeId === 'config-store') {
      localStorage.setItem('svg-editor-config', JSON.stringify(state))
    }
  })

  const eventsActive = ref(numberArray(20))
  const addEvent = () => {
    globalStore.handle_svg_info.info.events.push({
      type: '',
      action: '',
      target: '',
      scripts: 'console.log("234")',
      condition: {type: 'None'}
    })
  }

  const addEventList = (e, item) => {
    if (e === 'ChangeAttr') {
      item.attrs = [
        {
          key: '',
          val: ''
        }
      ]
    }
    else {
      delete item.attrs
    }
  }

  const deleteE = (i) => {
    globalStore.handle_svg_info.info.events.splice(i, 1)
  }
</script>

<template>
  <el-tabs class="mx-2 rightTabs" v-if="globalStore.intention != EGlobalStoreIntention.Select" v-model="activeName">
    <el-tab-pane label="图纸" name="page">
      <el-form label-width="60px" label-position="left">
        <el-form-item label="背景色" size="small">
          <el-color-picker v-model="configStore.svg.background_color" />
        </el-form-item>
        <el-form-item label="x原点" size="small">
          <el-input-number v-model="configStore.svg.position_center.x"></el-input-number>
        </el-form-item>
        <el-form-item label="y原点" size="small">
          <el-input-number v-model="configStore.svg.position_center.y"></el-input-number>
        </el-form-item>
        <el-form-item label="网格" size="small">
          <el-switch v-model="configStore.svg.grid"></el-switch>
        </el-form-item>
        <el-form-item label="标尺" size="small">
          <el-switch v-model="configStore.svg.ruler"></el-switch>
        </el-form-item>
        <el-form-item label="缩放" size="small">
          <el-input-number v-model="configStore.svg.scale" :step="0.1" step-strictly></el-input-number>
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="连线" name="line">
      <el-form label-width="60px" label-position="left" v-if="configStore.connection_line.props">
        <dynamic-el-form-item :obj-info="configStore.connection_line.props" :hide="['point_position']" />
      </el-form>
      <el-form label-width="60px" label-position="left" v-if="configStore.connection_line.animations">
        <dynamic-el-form-item :obj-info="configStore.connection_line.animations" />
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="结构" name="tree">
      <component-tree></component-tree>
    </el-tab-pane>
  </el-tabs>
  <el-tabs
      class="mx-2 rightTabs"
      v-else-if="globalStore.intention == EGlobalStoreIntention.Select && globalStore.handle_svg_info"
      v-model="activeNameB"
  >
    <el-tab-pane label="外观" name="style">
      <el-form label-width="60px" label-position="left">
        <el-form-item label="标题" size="small">
          <el-input v-model="globalStore.handle_svg_info.info.title" />
        </el-form-item>
        <el-form-item label="x坐标" size="small">
          <el-input-number v-model="globalStore.handle_svg_info.info.x"></el-input-number>
        </el-form-item>
        <el-form-item label="y坐标" size="small">
          <el-input-number v-model="globalStore.handle_svg_info.info.y"></el-input-number>
        </el-form-item>
        <el-form-item label="显示" size="small">
          <el-switch v-model="globalStore.handle_svg_info.info.display"></el-switch>
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="事件" name="event">
      <el-button type="primary" style="width: 100%;" @click="addEvent">添加事件</el-button>
      <el-collapse v-model="eventsActive">
        <el-collapse-item :name="i" v-for="(item,i) of globalStore.handle_svg_info.info?.events" :key="'event'+i">
          <template #title>
            <div class="events-title">
              <span>事件{{ i + 1 }}</span>
              <el-icon :size="16" class="bt-Icon" @click.stop="deleteE(i)">
                <svg-analysis name="delete" />
              </el-icon>
            </div>
          </template>
          <el-form label-width="90px" label-position="left">
            <el-form-item label="类型" size="small">
              <el-select v-model="item.type">
                <el-option value="Click" label="点击" />
                <el-option value="Change" label="值改变" />
              </el-select>
            </el-form-item>
            <el-form-item label="行为" size="small">
              <el-select v-model="item.action" @change="addEventList($event,item)">
                <el-option value="ChangeAttr" label="改变属性"></el-option>
                <el-option value="JavaScript" label="执行JavaScript"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="目标" size="small" v-if="item.action === 'ChangeAttr'">
              <el-input v-model="item.target" placeholder="默认自身" />
            </el-form-item>

            <list v-if="item.action === 'ChangeAttr'" v-model="item.attrs" />
            <condition v-model="item.condition" />
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-tab-pane>
    <el-tab-pane label="动效" name="animation">
      <el-form label-width="60px" label-position="left" v-if="globalStore.handle_svg_info.info.animations">
        <dynamic-el-form-item :obj-info="globalStore.handle_svg_info.info.animations"></dynamic-el-form-item>
      </el-form>
      <el-form label-width="60px" label-position="left" v-else-if="globalStore.handle_svg_info.info.common_animations">
        <el-form-item label="动画效果" size="small">
          <common-animate
              @update-common-ani-val="(val) => updateCommonAniVal(globalStore.handle_svg_info?.info, val)"
              :val="globalStore.handle_svg_info.info.common_animations.val"
          ></common-animate>
        </el-form-item>
        <el-form-item label="延迟" size="small">
          <el-select v-model="globalStore.handle_svg_info.info.common_animations.delay">
            <el-option value="delay-0s" label="无" />
            <el-option value="delay-1s" label="1秒" />
            <el-option value="delay-2s" label="2秒" />
            <el-option value="delay-3s" label="3秒" />
            <el-option value="delay-4s" label="4秒" />
            <el-option value="delay-5s" label="5秒" />
          </el-select>
        </el-form-item>
        <el-form-item label="动画速度" size="small">
          <el-select v-model="globalStore.handle_svg_info.info.common_animations.speed">
            <el-option value="slow" label="慢" />
            <el-option value="slower" label="最慢" />
            <el-option value="fast" label="快" />
            <el-option value="faster" label="最快" />
          </el-select>
        </el-form-item>
        <el-form-item label="循环次数" size="small">
          <el-select v-model="globalStore.handle_svg_info.info.common_animations.repeat">
            <el-option value="repeat-1" label="一次" />
            <el-option value="repeat-2" label="两次" />
            <el-option value="repeat-3" label="三次" />
            <el-option value="infinite" label="无限次" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="数据" name="data">
      <el-form label-width="90px" label-position="left">
        <el-form-item label="ID" size="small">
          <el-input v-model="globalStore.handle_svg_info.info.id" />
        </el-form-item>
        <div v-for="(e,k) in globalStore.handle_svg_info.info.state" :key="'state'+k">
          <el-form-item class="props-row" :label="String(k)" size="small"> {{ e.default }}</el-form-item>

          <el-form-item
              v-if="k === 'OnOff'"
              :label="globalStore.handle_svg_info.info.state?.OnOff.title"
              size="small"
          >
            <el-switch v-model="globalStore.handle_svg_info.info.state.OnOff.default"></el-switch>
          </el-form-item>
        </div>

        <div v-if="globalStore.handle_svg_info.info?.hasOwnProperty('tag_slot')">
          <el-form-item class="props-row" label="tag_slot" size="small"> {{
              globalStore.handle_svg_info.info.tag_slot
            }}
          </el-form-item>
          <el-form-item label="文字插槽" size="small">
            <el-input v-model="globalStore.handle_svg_info.info.tag_slot" />
          </el-form-item>
        </div>
        <dynamic-el-form-item :obj-info="globalStore.handle_svg_info.info.props" code />
      </el-form>
    </el-tab-pane>
    <el-tab-pane label="结构" name="tree">
      <component-tree />
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped lang="less">
  .events-title {
    width: calc(~'100% - 28px');
    display: flex;
    align-items: center;

    > span {
      font-weight: bold;
    }

    > i {
      margin-left: 15px;
    }
  }
</style>

<style lang="less">
  .rightTabs {
    .el-tabs__item {
      padding: 0 10px;
    }
  }
</style>
