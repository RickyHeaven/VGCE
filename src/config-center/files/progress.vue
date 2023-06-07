<script setup lang="ts">
  import {ref} from 'vue'
  const colors = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 },
  ]
  const percentage = ref(10)

</script>

<template>
  <el-progress type="dashboard" :percentage="percentage" :color="colors" />
</template>

<style lang="less" scoped>

</style>