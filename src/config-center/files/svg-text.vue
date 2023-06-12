<script setup lang="ts">
  // 文字的内容决定了长度 所以没办法预先定义中心点 导致连线有偏移
  import {nextTick, watch} from "vue"

  const emit = defineEmits(['resize'])

  const props = defineProps({
    fontFamily: {
      type: String,
      default: ''
    },
    fontSize: {
      type: Number,
      default: 15
    },
    text: {
      type: String,
      default: ''
    },
    fill: {
      type: String,
      default: ''
    }
  })

  watch(()=>[props.text,props.fontSize,props.fontFamily], () => {
    nextTick(function (){
      emit('resize')
    })
  })
</script>
<template>
  <text x="50" y="55" :font-family="props.fontFamily" :font-size="props.fontSize" :fill="props.fill">{{
      props.text
    }}
  </text>
</template>