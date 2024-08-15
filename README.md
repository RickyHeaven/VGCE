# VGCE

Vector graphics configure editor. 矢量图组态编辑器。

## Guide 使用说明

### 1. install 安装依赖

   ```
     npm i @zhangqingcq/vgce element-plus@2.8.0 ace-builds@1.14.0 lodash-es@^4.17.21 vue-echarts@6.5.1 animate.css@4.1.1
   ```

or

   ```
     pnpm add @zhangqingcq/vgce element-plus@2.8.0 ace-builds@1.14.0 lodash-es@^4.17.21 vue-echarts@6.5.1 animate.css@4.1.1
   ```

### 2. change main.ts or main.js 修改项目主文件

   ```
     //main.js or main.ts

     import 'element-plus/dist/index.css'
     import '@zhangqingcq/vgce/dist/style.css'
   ```

### 3. use editor 使用编辑器

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

### 4. use viewer 使用查看器

   ```
      <script setup lang="ts">
        import {SvgViewer} from '@zhangqingcq/vgce'
      </script>
      <template>
        <SvgViewer :data="xxx"/>
      </template>
   ```

### 5. custom toolbar 自定义组件

- copy `src/config/` and change as you want （复制`src/config/`文件夹，然后更改里面的配置）

- put svg files into `src/asset/svgs` , then file name need to be same with config.name （将svg文件放到`src/asset/svgs`
  ，文件名需要和配置文件里的`name`的值一致）

- put custom vue components file into `src/config/files`, then import in `src/config/index.ts` and export with `vueComp`
  （将自定义vue组件放到`src/config/files`，然后在`src/config/index.ts`引入并以`vueComp`
  具名导出，组件在vueComp下的key应和配置文件里`tag`的值一致）

- send the vue components to the editor and viewer with the props vueComp (在编辑器和查看器使用处把`src/config/index.ts`
  导出的vueComp引入并以`vueComp`作为props传递给编辑器和查看器组件)

  ```
  // editor

  <script setup lang="ts">
    import {SvgEditor} from '@zhangqingcq/vgce'
    import {config,vueComp} from '@/config'
  </script>
  <template>
    <SvgEditor :customToolbar="config" :vueComp="vueComp"/>
  </template>
  ```

  ```
  //viewer

  <script setup lang="ts">
    import {SvgViewer} from '@zhangqingcq/vgce'
    import {vueComp} from '@/config'
  </script>
  <template>
    <SvgViewer :vueComp="vueComp" :data="xxx"/>
  </template>
  ```
- PS: you have to install `vite-plugin-svg-icons` plugin to append your svg to html
  dom.（你需要在项目安装npm依赖`vite-plugin-svg-icons`，用以把svg文件添加到项目入口html文件中进行使用）

### 6. how to use `vite-plugin-svg-icons` 如何使用 vite-plugin-svg-icons

- `npm i vite-plugin-svg-icons -D` or `pnpm add vite-plugin-svg-icons -D` （安装依赖）
- change `vite.config.ts` （修改项目vite配置文件）

  ````
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
             customDomId: '__svg__icons__dom__'//your id, do not use this id!（使用你自己定义的id，不能使用__svg__icons__dom__，这是内置svg文件使用的id）
           })
         ],
         xxx
       })
       ```
  ````

- change `main.ts` （修改项目主文件）

  ```
  // main.ts

  import 'virtual:svg-icons-register'
  ```

- PS: if there is error: `Cannot find module ‘fast-glob’`,then run `npm i fast-glob -D` or `pnpm add fast-glob -D`
  （如果报前面的错，就安装`fast-glob`npm 依赖）

### 7.custom background 自定义编辑器和查看器背景
- 这是一个非常棒的功能，你可以通过editor和viewer的插槽自定义其背景，你可以在插槽中放入html元素，并给它加上丰富样式（拼接的各种颜色、渐变色，网格，小装饰等），也可以通过给元素设置图片背景或者直接放入图片来实现以图片为背景
 ```
  // editor

  <SvgEditor :data="xxx" @onPreview="previewHandle">
	<template #background>
	  <div style="height: 100%; width: 100%; background-color: red"></div>
	</template>
  </SvgEditor>
 ```
 ```
  // viewer

  <svgViewer :data="xxx">
	<template #background>
	  <div style="height: 100%; width: 100%; background-color: red"></div>
	</template>
  </svgViewer>
 ```
### 8.mqtt 通信

- 在编辑器右侧‘通信’菜单下配置好mqtt通信需要的url、username、password、topics
- 在使用查看器的地方监听查看器emit的`onMessage`事件，并处理事件返回的数据`{ topics, message }`
- message可以用JSON.parse解析成对象（后端推给前端的MQTT消息内容需要是JSON格式）
- 拿到消息后可以配合setNodeAttrByID方法更新界面
- setNodeAttrByID的参数id可以在传给本组件的props.data（用户传进来的，自然知道值是多少）里done_json找到
  > 如何找到指定组件的两种方案：
  > 1. 用你的项目里前后端约定的svg组件唯一标识符替换掉编辑器生成的id（必须保证唯一），然后调用setNodeAttrByID改变组件属性。
  > 2. 如果不想改动id（避免因不能保证手动改过的id唯一性导致编辑器功能异常），可以在config里给想要改变的组件的配置文件的props里增加一个字段，
       如deviceCode(svg-text的配置文件里有被注释的例子)，然后在编辑组态时，给对应组件填上对应的deviceCode（这样deviceCode就和组件id实现
       了映射关系），并保存，后台给前台推MQTT消息时带上指定的deviceCode，前台预览时，在收到MQTT消息后，凭借消息里的deviceCode在done_json
       找到组件的id（可以用vue的computed计算一份deviceCode和id的映射关系存到一个对象里，这样在需要id时可直接在计算出的对象凭借deviceCode
       直接取到），即可用setNodeAttrByID改变组件属性

### 9. example 查看示例

- download [VGCE](https://github.com/RickyHeaven/VGCE.git) （下载项目）

- `pnpm i` or `npm i` （安装依赖）

- `pnpm dev` or `npm run dev` （运行项目，使用示例参考`src/views`下两个页面）

### 注意：

- 本库ui框架使用的是`element-plus`，所以你需要在你的项目安装 element-plus 依赖，依赖版本按上面给出的版本
- 在你没有其他地方使用element-plus组件的情况下，可以不用完整安装element-plus
- 如果有少量使用其组件，也可以使用按需引入或手动引入，如果项目使用了其他UI框架，在不完整安装element-plus的情况下，是不会有冲突的
