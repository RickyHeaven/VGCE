# VGCE

Vector graphics configure editor. 矢量图组态编辑器。

[English Documentation](./README-EN.md)

## Features 特性亮点

- **开箱即用的编辑器 + 预览器**：`SvgEditor` 拖拽搭建，`SvgViewer` 只读展示，一份 JSON 数据模型驱动两端，编辑器产出的数据可直接交给预览器渲染。
- **面向工控与大屏的性能分级**：编辑器与预览器均内置 `high / medium / low` 三档性能预设，默认 `level: 'auto'`，依据 CPU 核心数、内存、设备像素比自动选择档位，低性能 PC 与工控机也能流畅运行。编辑器通过 `editorPerf` 配置，预览器通过 `previewPerf` 配置，均可通过 `forceLevel` 强制指定档位（详见下文第 8 节）。
- **视口虚拟渲染**：组件数量超过阈值时，只渲染与可视区域（含缓冲区）相交的节点，包围盒计算支持缩放与旋转（旋转组件按外接矩形裁剪，不会被过早剔除）。编辑器侧同样做视口裁剪，且选中/正在拖拽的组件始终保留，操作过程不会因裁剪而中断。
- **输入与渲染分离**：拖拽、滚轮缩放采用 `requestAnimationFrame` 帧缓冲，同一帧内的多次指针事件只做一次几何计算，并支持交互帧率上限（`fpsLimit`）。组件规模较大时画布依然跟手，缩放后也不会出现可视区内组件被错误裁掉的问题。
- **多级结果缓存**：变换矩阵、样式、动画类名、`v-bind` 属性、包围盒、连线索引均按签名缓存（`WeakMap`），同时让几何信息脱离响应式依赖，避免每帧对全量组件重算，属性变更（如 MQTT 推送文字）也不会触发整个列表重建。
- **低耦合，不污染宿主项目**：编辑器外壳改用内置轻量 UI 组件（`vgce-button`、`vgce-icon`、`vgce-tabs`、`vgce-color-picker` 等）替代部分 element-plus 组件；画布中的内置组件（`v-button`、`v-tag`）通过 `resolveCanvasComp` 局部解析，不注册到全局组件表，因此不会覆盖宿主应用自己的同名组件。
- **强大的扩展能力**：支持自定义 Vue 组件、自定义 SVG、自定义背景插槽、自定义工具栏配置，业务组件可随库一起分发；自定义组件还能 `inject('previewPerf')` 读取当前性能档位，做针对性降级。
- **事件与实时通信**：组件级点击/值改变事件、关系条件表达式、emit 回调；配合 MQTT 实时更新组件属性（`setNodeAttrByID`），连接在组件卸载时自动关闭并释放，避免残留监听。
- **TypeScript 友好**：提供完整类型声明，并对外导出 `EPreviewPerfLevel`、`IPreviewPerfOptions`、`detectPerfLevel` 等公共 API，接入即有类型提示。

## Capabilities 功能总览

### 编辑器 `SvgEditor`

| 能力 | 说明 |
| --- | --- |
| 组件库 | 左侧按分组展示：状态 SVG、静态 SVG、动画 SVG、SVG 组件、Vue 组件、图表，拖拽即可放入画布 |
| 选中与多选 | 空白区域按住左键框选（图形中心点落入选框即选中），或 `Ctrl + 左键` 逐个点选 |
| 变换 | 拖动交互点缩放、旋转组件，选中后可方向键微调位置（1px） |
| 画布操作 | 空白区域按住右键拖动画布，滚轮以鼠标位置为中心缩放；右侧「图纸」栏可精确设置 X/Y 偏移、缩放、背景色、网格与网格颜色，并支持一键重置位置 |
| 标尺与辅助线 | 内置标尺，可在标尺区域拖出辅助线，拖回标尺即可删除 |
| 撤销与重做 | 记录最近 10 步操作，`Ctrl + Z` 撤销、`Ctrl + Shift + Z` 重做，顶部工具栏同步显示可用状态 |
| 快捷键 | 方向键移动、`Ctrl + 方向键` 调整层级（上/下移一层、置顶/置底）、`Delete` 删除、`Ctrl + C` 复制、`Ctrl + Delete` 清空画布 |
| 连线 | 顶部按钮进入连线状态，左键起笔、再次左键增加节点、右键结束；画线时按住 `Ctrl` 画竖线、`Shift` 画横线；支持组件锚点自动吸附绑定，连线首尾节点可绑定/解绑锚点，右侧「连线」栏统一配置连线样式与动画 |
| 属性面板 | 选中组件后右侧提供「外观 / 数据 / 事件 / 动效 / 结构」五个面板，可改标题、坐标、缩放、旋转、显示状态、业务属性、动画效果与层级结构 |
| 全局配置 | 未选中组件时右侧提供「图纸 / 连线 / 通信 / 结构」面板，分别配置画布、连线样式与动画、MQTT 连接信息、组件树 |
| 组件树 | 「结构」面板以树形展示全部组件，支持选中定位 |
| 导入导出 | 顶部可导入/导出数据模型 JSON（支持读取本地 txt/json 文件），也可直接导出为 SVG 文件 |
| 保存与预览 | 触发 `onSave` 回传数据模型（`saveFile` 为 `true` 时同时下载 JSON 文件），`onPreview` 回传数据模型供预览器渲染，`onReturn` 供宿主返回上一页 |
| 性能分级 | `editorPerf` / `forceLevel` 控制性能档位，影响视口裁剪阈值、CSS 动画开关、交互帧率上限（详见第 8 节） |
| 国际化 | `locale` 支持 `zh-CN` / `en-US`，也可调用库导出的 `setLocale()` 全局切换，`translate()` 供自定义组件取文案，`configMessages` / `registerMessages()` 可为组件配置数据补充英文映射（详见 12.1 节） |

### 预览器 `SvgViewer`

| 能力 | 说明 |
| --- | --- |
| 只读渲染 | 接收编辑器产出的 `data` 数据模型（`layout_center` + `config` + `done_json`），完整还原画布、组件、连线与动画 |
| 交互开关 | `canvasDrag` / `canvasZoom` / `showCanvasInfo` 分别控制拖拽画布、滚轮缩放、画布信息显示 |
| 性能分级 | `previewPerf` / `forceLevel` 控制性能档位，`getPerfLevel()` 可读取当前生效档位（详见第 8 节） |
| 实时通信 | 内置 MQTT 订阅，收到消息后通过 `onMessage` 抛出 `{ topics, message }`；调用 `setNodeAttrByID(id, attr, val)` 即可定点更新组件属性 |
| 事件回调 | 组件事件触发时通过 `onEvent` 抛出 `{ event, target }`，可在宿主中执行跳转、弹窗等业务逻辑 |
| 自定义背景 | `#background` 插槽可放置任意 HTML / 图片作为画布背景 |
| 国际化 | `locale` 支持 `zh-CN` / `en-US`，画布信息等内置文案随语言切换 |

### 内置组件

| 分类 | 组件 |
| --- | --- |
| 基础展示 | 文字 `svg-text`、文字背景框 `text-box`、按钮 `v-button`、标签 `v-tag`、进度条 `progress-a` |
| 数据展示 | 通用表格 `common-table`、饼图 `pie-charts`（基于 vue-echarts） |
| 状态与时间 | 开关 `switch-r`、灯 `light`、警示灯 `alert-light`、时钟 `clock-a`、当前时间 `now-time` |
| 动画 | 温度计 `thermometer`，并内置几十种组件动效，可应用到任意组件 |
| 静态图形 | 2 号机、9 号机、汉堡、火锅等无状态 SVG 图形 |

### 数据与扩展

- **数据模型**：`{ layout_center, config, done_json }` 一份 JSON 描述画布位置、全局配置与全部组件，编辑器与预览器共用，便于持久化与后端下发。
- **自定义组件**：将业务 Vue 组件放入 `src/config/files` 并通过 `vueComp` 传入，即可在编辑器中拖拽使用、在预览器中渲染；组件可自行声明 `props` 配置项，编辑器会自动生成属性表单（详见第 5 节）。
- **自定义配置**：`customToolbar` 可整体替换左侧组件库分组与每个组件的属性项（输入框、数字、颜色、开关、下拉、JSON 编辑等）。
- **事件系统**：组件级「点击 / 值改变」事件，支持「修改属性 / 执行 JavaScript / emit 事件」三种行为，并可附加关系运算条件（详见第 10 节）。

## Guide 使用说明

### 1. install 安装依赖

   ```
     npm i @zhangqingcq/vgce element-plus@2.8.6 pinia@^2.1.3 ace-builds@1.14.0 lodash-es@^4.17.21 vue-echarts@6.5.1 echarts@5.5.1 mqtt@5.1.3 vite-plugin-svg-icons@^2.0.1
   ```

or

   ```
     pnpm add @zhangqingcq/vgce element-plus@2.8.6 pinia@^2.1.3 ace-builds@1.14.0 lodash-es@^4.17.21 vue-echarts@6.5.1 echarts@5.5.1 mqtt@5.1.3 vite-plugin-svg-icons@^2.0.1
   ```

### 2. change main.ts or main.js 修改项目主文件

   ```
     //main.js or main.ts

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

  > 访问 GitHub 不便时，可直接从 npm 包里复制：`node_modules/@zhangqingcq/vgce/src/config`（该目录已随包发布）。
  > 目录内全部使用相对路径和显式 `import { ... } from 'vue'`，不引用库源码、不依赖别名、不依赖 `unplugin-auto-import`，
  > 复制到你的项目后**无需任何调整即可直接编译运行**；
  > 仅 `files/now-time.vue`、`files/text-box.vue` 使用了 less 样式，项目需自行安装 `less`。

  目录里的 `i18n.ts` 承担了这个目录的全部国际化工作，属于数据层，可按你的需要自由编辑：

  - `configMessages`：组件配置数据的英文映射表（以中文原文为 key），影响左侧组件库、右侧工具栏的表单 label 等
  - `configLocaleText`：画布组件内部动态文案（如 `now-time` 的星期名、月份名、日期格式）
  - 内置组件与内置配置项的英文映射已随库内置，复制后即使不传 `configMessages`，中英文切换也能正常工作
  - 当你在 `src/config` 里新增组件、或改动了 `title`/`props` 的中文原文后，在 `i18n.ts` 里补充对应英文，
    并在使用处把 `configMessages` 一起传给 `SvgEditor`（字段清单见 12.1 节）

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
    import {configMessages} from '@/config/i18n'
  </script>
  <template>
    <SvgEditor :customToolbar="config" :configMessages="configMessages" :vueComp="vueComp"/>
  </template>
  ```

- `src/config/i18n.ts` 用于组件配置数据的英文映射（分组标题、组件类型名、配置项标题、下拉 `label`、自定义动画、状态选项等，
  完整的可翻译字段清单与不可翻译字段见 12.1 节），复制 `src/config/` 后可自行补充或修改，
  再通过 `configMessages` 属性传给编辑器；未传入时使用库内置词条。映射以中文原文为 key，只在英文环境下生效。

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
  dom.（你需要在项目安装npm依赖`vite-plugin-svg-icons`，用以把svg文件添加到项目入口html文件中进行使用，第 1 节安装脚本已包含此依赖，一般无需再次单独安装）

### 6. how to use `vite-plugin-svg-icons` 如何使用 vite-plugin-svg-icons

- `npm i vite-plugin-svg-icons -D` or `pnpm add vite-plugin-svg-icons -D` （如果未按第 1 节脚本安装，需单独执行此命令）
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

  <SvgEditor :data="xxx" slotBackground @onPreview="previewHandle">
	<template #background>
	  <div style="height: 100%; width: 100%; background-color: red"></div>
	</template>
  </SvgEditor>
  
  //注意：使用自定义背景功能时，editor的slotBackground属性传true，让‘图纸’面板‘背景色’功能不可见，避免让操作者产生‘背景色设置不生效’的错觉
 ```
 ```
  // viewer

  <SvgViewer :data="xxx">
	<template #background>
	  <div style="height: 100%; width: 100%; background-color: red"></div>
	</template>
  </SvgViewer>
 ```
### 8.性能相关配置

   > `SvgEditor` 与 `SvgViewer` 均内置性能分级，默认 `level: 'auto'` 自动检测设备性能档位。检测逻辑基于 CPU 核心数、内存大小、设备像素比，将设备分为 `high` / `medium` / `low` 三档，低性能 PC 或工控机也能流畅运行。

#### 8.1 编辑器性能配置 `editorPerf`

   ```
     <SvgEditor :data="xxx" :editorPerf="{...}"/>
   ```

   > `editorPerf` 可配置项：

   | 字段 | 类型 | 说明 |
   | --- | --- | --- |
   | `level` | `'auto' \| 'high' \| 'medium' \| 'low'` | 性能档位，默认 `'auto'` 自动检测 |
   | `animations` | `boolean` | 是否启用 CSS 动画（animate.css / common-ani） |
   | `fpsLimit` | `number` | 拖拽/缩放等交互的最大帧率，`<=0` 表示不限制 |
   | `clipThreshold` | `number` | 触发视口裁剪的组件数量阈值，超出后只渲染可视区节点 |

   > 编辑器各档位默认策略：

   | 档位 | `animations` | `fpsLimit` | `clipThreshold` | 说明 |
   | --- | --- | --- | --- | --- |
   | `high` | ✅ | 60 | 400 | 全效果，适合高性能 PC |
   | `medium` | ❌ | 30 | 200 | 关闭动画、降帧率、提前启动裁剪，适合中端 PC |
   | `low` | ❌ | 20 | 100 | 最保守策略，拖拽/缩放时冻结画布视觉、交互结束后一次性跳转，避免中间帧触发布局重算，适合老旧 PC 与工控机 |

   > 编辑器的 `forceLevel` 属性可强制指定档位（覆盖 `editorPerf.level`）。

#### 8.2 预览器性能配置 `previewPerf`

   ```
     <SvgViewer :data="xxx" :previewPerf="{...}"/>
   ```

   > `previewPerf` 可配置项：

   | 字段 | 类型 | 说明 |
   | --- | --- | --- |
   | `level` | `'auto' \| 'high' \| 'medium' \| 'low'` | 性能档位，默认 `'auto'` 自动检测 |
   | `animations` | `boolean` | 是否启用组件动画（animate.css 类动画） |
   | `chartAutoResize` | `boolean` | 图表是否跟随尺寸自动重绘（低端设备建议关闭） |
   | `minChartInterval` | `number` | 图表数据刷新的最小间隔（毫秒） |
   | `fpsLimit` | `number` | 拖拽/缩放等交互的最大帧率，`<=0` 表示不限制 |
   | `nodeVirtual` | `boolean` | 是否启用视口虚拟渲染（只渲染可视区域组件） |
   | `nodeVirtualThreshold` | `number` | 触发视口虚拟渲染的组件数量阈值 |

   > 预览器各档位默认策略：`high` 全效果开启；`medium` 关闭图表自动重绘、帧率限制 30；`low` 额外关闭动画、帧率限制 20，且拖拽/缩放时冻结画布视觉、交互结束后一次性跳转。
   > 也可单独使用 `forceLevel` 属性强制指定档位。自定义 vue 组件可通过 `inject('previewPerf')` 读取当前生效的性能配置，从而做针对性降级。

### 9.mqtt 通信

 - mqtt通信配置有两种方案：
  > 方案1.通过编辑器（editor）的`mqtt`属性传递配置，如：
  ```
    <SvgEditor :mqtt="{cover:true,url:'xxx',user:'xxx',pwd:'xxx',topics:'xxx'}">
    // cover：是否使用这里的配置覆盖通信面板设置（也就是后面将介绍的第二种方案）的配置，为ture则覆盖，一般这里进行配置了，通信面板就无需再配置，
              所以这里一般都要传true。当然，如果你只想将这里的配置作为备选方案，如果使用者在编辑器通信面板进行了配置，则使用通信面板的配置，这里传false。
  ```
  > 方案2.在编辑器右侧‘通信’菜单下配置好mqtt通信需要的url、username、password、topics,注意：关闭通信面板‘外部配置’选项方可进行独立配置且使配置生效。
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

### 10.event 事件处理
- 编辑器内组件支持事件处理，首先在选中组件时，右侧“事件”菜单下，可以添加事件（1个或多个）
- 添加事件后可以选择事件类型、行为、条件（条件非必填）
- 事件类型即触发类型，现有“点击”和“值改变”，点击即组件被点击触发，值改变即组件向外部emit `on-change`事件（一般为自定义vue组件才具备这个能力）时触发
- 事件行为即事件出发后要执行的动作，现有“改变属性”、“执行 JavaScript”、“emit 事件”
- 改变属性即改变自身和其他组件（其他组件需指定id）属性，需要指定要改变的key和想设定的value，一次可改多个属性
- 执行 JavaScript即运行输入的js代码
- emit 事件即viewer向外emit `on-event`事件，并传递{event,target}数据，event即当前事件的详细数据，target即当前组件的详细数据
- 条件即事件触发的额外条件，现有“关系运算”，即组件自身属性在满足给出的选定情况下，可以触发事件

### 11. example 查看示例

- download [VGCE](https://github.com/RickyHeaven/VGCE.git) （下载项目）

- `pnpm i` or `npm i` （安装依赖）

- `pnpm dev` or `npm run dev` （运行项目，使用示例参考`src/views`下两个页面）

### 12. i18n 国际化

- 库内置中文、英文两种语言，默认中文，`SvgEditor` 与 `SvgViewer` 均支持 `locale` 属性（`'zh-CN'` | `'en-US'`）
- 也可在任意时机调用 `setLocale('en-US')` 全局切换，`getLocale()` 读取当前语言，`useVgceLocale()` 取得只读的响应式语言引用
- 自定义组件中的文案可用 `translate(key)` 取当前语言，`key` 即中文原文，缺失时回退为原文；`t` 是 `translate` 的别名

```vue
<script setup lang="ts">
	import { SvgEditor, setLocale, translate } from '@zhangqingcq/vgce'

	// 全局切换为英文
	setLocale('en-US')

	// 自定义组件里取文案
	const label = translate('保存')
</script>

<template>
	<!-- 也可直接由属性指定，组件内部会监听变化 -->
	<SvgEditor locale="en-US" />
</template>
```

#### 12.1 组件配置数据（`src/config`）的国际化

`src/config` 下的组件配置数据属于**数据层**，不能直接跟随语言切换，因此采用「以中文原文为 key 的映射表」方案：

- 中文环境下 `translate()` 直接返回原文，映射表不生效，配置数据保持中文，可读性不受影响
- 英文环境下按映射表替换为对应英文，未命中则回退为原文（不会出现空白或报错）
- 映射表由使用者维护，不硬编码在库内部，复制 `src/config/` 目录后即可按自己的组件自由增删

**可配置国际化的字段**（由编辑器内部调用 `translate()` 渲染）：

| 配置字段 | 出现位置 | 说明 |
| --- | --- | --- |
| `IConfigComponentGroup.title` | 左侧组件库分组标题 | 分组名，如 `'静态SVG'`、`'VUE组件'` |
| `IConfigItem.title` | 左侧组件库组件悬浮提示 | 组件**类型**名，如 `'按钮'`、`'饼图'` |
| `IConfigItem.props[key].title` | 右侧工具栏属性表单 label | 配置项名称，如 `'宽度'`、`'背景颜色'` |
| `IConfigItem.props[key].options[].label` | 右侧工具栏 Select 下拉显示文案 | 仅 `label` 参与翻译，`value` 为实际取值，**不可翻译** |
| `IConfigItem.animations[key].title` 与 `.options[].label` | 右侧工具栏自定义动画（如连线动画类型） | 自定义动画的标题与选项 |
| `IConfigItem.state[key].label` | 右侧工具栏「状态」下拉 | 有状态组件的状态选项 |

> 上述字段本身就是英文时（例如 `state` 的 `label` 直接写成 `'Normal'`），无需再补映射，`translate()` 会原样返回。

**不参与国际化的字段**（属标识符或业务数据，翻译会破坏功能或语义）：

| 字段 | 原因 |
| --- | --- |
| `IConfigItem.name` | 与 `src/asset/svgs` 下的 svg 文件名一一对应 |
| `IConfigItem.tag` | 与 `vueComp` 中的组件 key 一一对应 |
| `IConfigItem.type`、`groupType`、`config` | 枚举值 / 逻辑配置，仅内部使用 |
| `IConfigItem.props[key].val` | 组件实际数据（按钮文字、设备编码等），属业务内容 |
| `IConfigItem.props[key].options[].value` | 下拉项的实际取值，翻译后数据将无法匹配 |
| 组件**实例**的 `title` | 见下方说明 |

**关于组件实例 `title`**：组件被拖入画布时，`IConfigItem.title` 会作为初始名称写入数据模型（`done_json[].title`）。这个字段是用户用来识别组件的**实例名**（例如把两个按钮改成「启动按钮」「停止按钮」），因此：

- 右侧「外观」面板的标题输入框、「结构」面板的组件树都**按原值显示，不做翻译**，保证用户看到的名称与实际保存值一致
- 也意味着在英文环境下，新拖入组件的默认名称仍是配置里的中文 key，需要英文名称时可在「外观」面板手动改名，或把配置里的 `title` 直接写成英文

**接入方式**（与 `customToolbar` 一致，由使用方传入，库不读取你项目里的文件）：

```ts
// src/config/i18n.ts —— 以中文原文为 key 的英文映射
export const configMessages: Record<string, string> = {
	'按钮': 'Button',
	'尺寸': 'Size',
	'宽度': 'Width'
	// ...
}
```

```vue
<script setup lang="ts">
	import { SvgEditor } from '@zhangqingcq/vgce'
	import { config, vueComp } from '@/config'
	import { configMessages } from '@/config/i18n'
</script>
<template>
	<SvgEditor :customToolbar="config" :configMessages="configMessages" :vueComp="vueComp" locale="en-US" />
</template>
```

- 也可以通过库导出的 `registerMessages(messages, target?)` 在任意时机注册，`target` 默认为 `'en-US'`
- 未传入 `configMessages` 时，使用库内置的映射（覆盖内置组件）；传入时与内置映射合并，同 key 以传入值为准
- 该映射表只影响编辑器 UI 的展示，不会修改 `data` 中的原始值，保存和导出的数据模型仍是中文原文

**画布组件内部的动态文案**（如 `now-time` 的星期、月份、日期格式）：

这类文案由组件在运行时计算，无法用「中文原文 → 英文」的映射表处理，因此放在 `i18n.ts` 的 `configLocaleText` 里按语言维护：

```ts
// src/config/i18n.ts
export const configLocaleText = {
	'zh-CN': {
		weekday: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
		month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		dateFormat: '{year}年{month}{day}日'
	},
	'en-US': {
		weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		dateFormat: '{month} {day}, {year}'
	}
}
```

组件本身**不引用库源码**，通过 `inject(configLocaleKey)` 拿到当前语言（编辑器和查看器已在画布层 `provide`），
再配合 `formatConfigDate()` / `getConfigWeekday()` 取文案：

```ts
// src/config/files/now-time.vue
import { computed, inject, ref } from 'vue'
import { configLocaleKey, formatConfigDate, getConfigWeekday } from '../i18n'

const locale = inject(configLocaleKey, ref('zh-CN'))
const date = computed(() => formatConfigDate(now_date.value, locale.value))
const week = computed(() => getConfigWeekday(now_date.value, locale.value))
```

这样整份 `src/config/` 复制到你项目后不依赖库的任何导出，语言文案全部可在 `i18n.ts` 内自行修改；
你自定义的组件若也有动态文案，按同样方式读取 `configLocaleKey` 并在 `configLocaleText` 里补充即可。

### 注意：

- 本库ui框架使用的是`element-plus`，所以你需要在你的项目安装 element-plus 依赖，依赖版本按上面给出的版本
- 在你没有其他地方使用element-plus组件的情况下，可以不用完整引入element-plus
- 如果有少量使用其组件，也可以使用按需引入或手动引入
- 如果项目使用了其他UI框架，编辑器的element-plus组件样式可能会被其他框架污染，但由于编辑器使用的组件不多，且不会出现大面积污染，可自行写样式解决编辑器样式被污染的问题
- 如果项目使用了其他UI框架，由于编辑器的使用不需要完全引入element-plus，所以不用担心element-plus污染项目中其他UI框架组件