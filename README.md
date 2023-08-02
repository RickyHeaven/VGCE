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
5. custom toolbar
  * copy `src/config/` and change as you want

  * put svg files into `src/asset/svgs` , then file name need to be same with config.name

  * put custom parts file into `src/config/files`, then import in `src/config/index.ts`  and export with `vueComp`

  * PS: you have to install `vite-plugin-svg-icons` plugin to append your svgs to html dom.
    ```
    <script setup lang="ts">
      import {SvgEditor} from '@zhangqingcq/vgce'
      import {config} from '@/config'
    </script>
    <template>
      <SvgEditor :customToolbar="config"/>
    </template>
    ```
5.1 how to use `vite-plugin-svg-icons`
  * `npm i vite-plugin-svg-icons -D` or `pnpm add vite-plugin-svg-icons -D`

  * change `vite.config.ts`
    ```
    // vite.config.ts
    
    import { fileURLToPath, URL } from 'node:url'
    import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
    
    export default defineConfig({
      plugins: [
        xxx,
        createSvgIconsPlugin({
          iconDirs: [fileURLToPath(new URL('./src/assets/svgs', import.meta.url))], 
          symbolId: 'svg-[name]',
          svgoOptions: false,
          customDomId: '__svg__icons__dom__'//your id, do not use this id!
        })
      ],
      xxx
    })
    ```
  * change `main.ts`
    ```
    // main.ts
    
    import 'virtual:svg-icons-register'
    ```
  * PS: if there is error: `Cannot find module ‘fast-glob’`,then run `npm i fast-glob -D` or `pnpm add fast-glob -D`
6. example
   * download [VGCE](https://github.com/RickyHeaven/VGCE.git)
   
   * `pnpm i` or `npm i`
   
   * `pnpm dev` or `npm run dev`
