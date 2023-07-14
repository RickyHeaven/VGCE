# VGCE

Vector graphics configure editor. 矢量图组态编辑器。

## Guide

1. `npm i @zhangqingcq/vgce` or `pnpm add @zhangqingcq/vgce`

2. `import '@zhangqingcq/vgce/style'` in main.ts

3. editor

```
<script setup lang="ts">
  import {SvgEditor} from '@zhangqingcq/vgce'
  
  function preview(d: any) {
    //save d and send it to SvgViewer's data 
  }
</script>
<template>
  <SvgEditor @onPreview="preview"/>
</template>
```

4. viewer

```
<script setup lang="ts">
  import {SvgViewer} from '@zhangqingcq/vgce'
</script>
<template>
  <SvgViewer :data="xxx"/>
</template>
```

5.custom toolbar
* copy `src/config/` and change as you want
* put svg files into `src/asset/svgs` , then file name need to be same with config.name
* put custom parts file into `src/config/files`, then import in `src/config/index.ts`  and export with `vueComp`
```
<script setup lang="ts">
  import {SvgEditor} from '@zhangqingcq/vgce'
  import {config} from '@/config'
</script>
<template>
  <SvgEditor @customToolbar="config"/>
</template>
```
