<script setup lang="ts">
  import {IAttrItem} from "@/config-center/types"
  import {ElIcon, ElInput} from "element-plus"
  import SvgAnalysis from "@/components/svg-analysis/index.vue"
  import {computed} from "vue"

  const props = withDefaults(defineProps<{ modelValue: IAttrItem[] }>(), {
    modelValue: () => [
      {
        key: '',
        val: ''
      }
    ]
  })
  const emit = defineEmits(['update:modelValue'])

  const value = computed({
    get() {
      return props.modelValue
    },
    set(val) {
      emit('update:modelValue', val)
    }
  })

  const addL = () => {
    value.value.push({
      key: '',
      val: ''
    })
  }

  const deleteL = (i) => {
    value.value.splice(i, 1)
  }

</script>

<template>
  <div class="wall-l">
    <div class="head-l">
      <span>key</span>
      <span>value</span>

      <el-icon :size="17" class="bt-Icon" @click="addL">
        <svg-analysis name="add" />
      </el-icon>
    </div>
    <div class="row-l" v-for="(item,i) of value">
      <el-input class="content-l" v-model="item.key" />
      <el-input class="content-l" v-model="item.val" />

      <el-icon :size="14" class="bt-Icon" @click="deleteL(i)">
        <svg-analysis name="delete" />
      </el-icon>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .wall-l {
    .head-l {
      display: flex;
      align-items: center;

      span {
        display: inline-block;
        width: 42%;
        margin-right: 10px;
      }
    }

    .row-l {
      .content-l {
        width: 42%;
        margin-right: 10px;
      }
    }
  }
</style>