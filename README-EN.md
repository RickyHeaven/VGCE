# VGCE

Vector graphics configuration editor.

## Features

- **Ready-to-use editor + viewer**: Build layouts by dragging and dropping in `SvgEditor`, display them read-only with `SvgViewer`. A single JSON data model drives both sides, so the data produced by the editor can be handed directly to the viewer for rendering.
- **Performance tiers for industrial control and large screens**: Both the editor and the viewer ship with three built-in performance presets — `high / medium / low`. By default `level: 'auto'` is used, which automatically picks a tier based on CPU core count, memory and device pixel ratio, so low-end PCs and industrial computers can still run smoothly. The editor is configured via `editorPerf`, the viewer via `previewPerf`; both also support `forceLevel` to force a specific tier (see section 8 below for details).
- **Viewport-based virtual rendering**: When the number of components exceeds a threshold, only nodes intersecting the visible area (including a buffer) are rendered. Bounding-box calculation supports scaling and rotation (rotated components are clipped by their circumscribed rectangle, so they are not culled prematurely). The editor also performs viewport culling, while selected or currently dragged components are always kept, so an operation is never interrupted by culling.
- **Separation of input and rendering**: Dragging and wheel zooming are buffered with `requestAnimationFrame`; multiple pointer events within the same frame result in only one geometry computation, and an interaction frame-rate cap (`fpsLimit`) is supported. The canvas stays responsive even with a large number of components, and components inside the viewport are no longer incorrectly clipped after zooming.
- **Multi-level result caching**: Transform matrices, styles, animation class names, `v-bind` attributes, bounding boxes and edge indexes are all cached by signature (`WeakMap`), and geometry information is decoupled from reactive dependencies, avoiding recomputation of all components on every frame. Attribute changes (such as text pushed via MQTT) do not trigger a full list rebuild either.
- **Low coupling, no pollution to the host project**: The editor shell uses built-in lightweight UI components (`vgce-button`, `vgce-icon`, `vgce-tabs`, `vgce-color-picker`, etc.) instead of some element-plus components. Built-in components inside the canvas (`v-button`, `v-tag`) are resolved locally via `resolveCanvasComp` and are not registered in the global component table, so they will not override the host application's own components with the same name.
- **Powerful extensibility**: Custom Vue components, custom SVG, custom background slots and custom toolbar configuration are all supported; business components can be distributed together with the library. Custom components can also `inject('previewPerf')` to read the current performance tier and degrade themselves accordingly.
- **Events and real-time communication**: Component-level click/value-change events, relational condition expressions and emit callbacks; combined with MQTT for real-time attribute updates (`setNodeAttrByID`). Connections are automatically closed and released when components unmount, avoiding leftover listeners.
- **TypeScript friendly**: Complete type declarations are provided, and public APIs such as `EPreviewPerfLevel`, `IPreviewPerfOptions` and `detectPerfLevel` are exported, so you get type hints as soon as you integrate.

## Capabilities

### Editor `SvgEditor`

| Capability | Description |
| --- | --- |
| Component library | Grouped on the left: state SVG, static SVG, animated SVG, SVG components, Vue components, charts — drag and drop to place them on the canvas |
| Selection and multi-selection | Hold the left button on empty space to box-select (a shape is selected when its center point falls inside the box), or click one by one with `Ctrl + left click` |
| Transform | Scale and rotate components with drag handles; after selection, fine-tune position with arrow keys (1px) |
| Canvas operations | Hold the right button on empty space to pan the canvas; wheel zoom centers on the mouse position. The "Canvas" panel on the right lets you precisely set X/Y offset, zoom, background color, grid and grid color, and reset the position with one click |
| Rulers and guides | Built-in rulers; drag out guides from the ruler area, and drag them back onto the ruler to delete them |
| Undo and redo | Records the last 10 operations; `Ctrl + Z` to undo, `Ctrl + Shift + Z` to redo; the top toolbar reflects the availability state |
| Shortcuts | Arrow keys to move, `Ctrl + arrow keys` to change stacking order (move up/down one level, bring to front/send to back), `Delete` to delete, `Ctrl + C` to copy, `Ctrl + Delete` to clear the canvas |
| Connections | A top button switches to connection mode: left click to start, left click again to add a node, right click to finish; hold `Ctrl` while drawing for a vertical line and `Shift` for a horizontal line. Component anchors can be snapped and bound automatically; the first and last nodes of a connection can bind/unbind anchors, and the "Connection" panel on the right configures connection style and animation centrally |
| Property panel | After selecting a component, five panels — "Appearance / Data / Events / Animation / Structure" — are available on the right, for changing title, coordinates, scale, rotation, visibility, business attributes, animation effects and stacking structure |
| Global configuration | With no component selected, four panels — "Canvas / Connection / Communication / Structure" — are available on the right, for configuring the canvas, connection style and animation, MQTT connection information and the component tree |
| Component tree | The "Structure" panel shows all components as a tree and supports selecting to locate |
| Import and export | Import/export the data model JSON at the top (local txt/json files are supported), and export directly as an SVG file |
| Save and preview | Triggers `onSave` to return the data model (also downloads a JSON file when `saveFile` is `true`), `onPreview` to return the data model for the viewer to render, and `onReturn` for the host to go back to the previous page |
| Performance tiers | `editorPerf` / `forceLevel` control the performance tier, affecting the viewport-clipping threshold, CSS animation toggle and interaction frame-rate cap (see section 8) |
| i18n | `locale` supports `zh-CN` / `en-US`; the exported `setLocale()` switches globally, `translate()` provides texts for custom components, and `configMessages` / `registerMessages()` map component config data to English (see section 12.1) |

### Viewer `SvgViewer`

| Capability | Description |
| --- | --- |
| Read-only rendering | Receives the `data` model produced by the editor (`layout_center` + `config` + `done_json`) and fully restores the canvas, components, connections and animations |
| Interaction switches | `canvasDrag` / `canvasZoom` / `showCanvasInfo` control canvas dragging, wheel zooming and canvas info display respectively |
| Performance tiers | `previewPerf` / `forceLevel` control the performance tier; `getPerfLevel()` reads the currently effective tier (see section 8) |
| Real-time communication | Built-in MQTT subscription; received messages are emitted through `onMessage` as `{ topics, message }`; call `setNodeAttrByID(id, attr, val)` to update a component's attributes at a specific target |
| Event callbacks | When a component event fires, `onEvent` emits `{ event, target }`, so the host can run business logic such as navigation or dialogs |
| Custom background | The `#background` slot accepts arbitrary HTML / images as the canvas background |
| i18n | `locale` supports `zh-CN` / `en-US`; built-in texts such as canvas info follow the language switch |

### Built-in components

| Category | Components |
| --- | --- |
| Basic display | Text `svg-text`, text background box `text-box`, button `v-button`, tag `v-tag`, progress bar `progress-a` |
| Data display | Generic table `common-table`, pie chart `pie-charts` (based on vue-echarts) |
| State and time | Switch `switch-r`, light `light`, warning light `alert-light`, clock `clock-a`, current time `now-time` |
| Animation | Thermometer `thermometer`, plus dozens of built-in component animation effects that can be applied to any component |
| Static graphics | Stateless SVG graphics such as Machine No. 2, Machine No. 9, hamburger and hot pot |

### Data and extension

- **Data model**: `{ layout_center, config, done_json }` — a single JSON describing the canvas position, global configuration and all components. It is shared by the editor and the viewer, making it easy to persist and to deliver from the backend.
- **Custom components**: Put business Vue components into `src/config/files` and pass them in via `vueComp`, then you can drag and use them in the editor and render them in the viewer. Components can declare their own `props` configuration items, and the editor will automatically generate the property form (see section 5).
- **Custom configuration**: `customToolbar` can completely replace the left-hand component library groups and the property items of each component (input, number, color, switch, select, JSON editor, etc.).
- **Event system**: Component-level "click / value change" events support three behaviors — "modify attribute / execute JavaScript / emit event" — and can be combined with relational condition expressions (see section 10).

## Guide

### 1. Install dependencies

   ```
     npm i @zhangqingcq/vgce element-plus@2.8.6 pinia@^2.1.3 ace-builds@1.14.0 lodash-es@^4.17.21 vue-echarts@6.5.1 echarts@5.5.1 mqtt@5.1.3 vite-plugin-svg-icons@^2.0.1
   ```

or

   ```
     pnpm add @zhangqingcq/vgce element-plus@2.8.6 pinia@^2.1.3 ace-builds@1.14.0 lodash-es@^4.17.21 vue-echarts@6.5.1 echarts@5.5.1 mqtt@5.1.3 vite-plugin-svg-icons@^2.0.1
   ```

### 2. Change main.ts or main.js

   ```
     //main.js or main.ts

     import '@zhangqingcq/vgce/dist/style.css'
   ```

### 3. Use the editor

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

### 4. Use the viewer

   ```
      <script setup lang="ts">
        import {SvgViewer} from '@zhangqingcq/vgce'
      </script>
      <template>
        <SvgViewer :data="xxx"/>
      </template>
   ```

### 5. Custom toolbar / custom components

- Copy `src/config/` and change it as you want.

  > If GitHub is not reachable, copy it straight from the npm package: `node_modules/@zhangqingcq/vgce/src/config` (this folder ships with the package).
  > Everything inside uses relative paths and explicit `import { ... } from 'vue'` — it never references the library source, needs no alias
  > configuration and does not depend on `unplugin-auto-import`, so it **compiles and runs as is** right after copying.
  > Only `files/now-time.vue` and `files/text-box.vue` use less styles, so your project needs `less` installed.

  `i18n.ts` in that folder handles all the i18n of this directory. It is data-layer content, free for you to edit:

  - `configMessages`: the English mapping table for the component config data (keyed by the original Chinese text); it drives the left component
    library and the form labels of the right panel.
  - `configLocaleText`: the dynamic text rendered inside canvas components (e.g. weekday / month names and the date format of `now-time`).
  - The English mappings for the built-in components and config items ship with the library, so language switching works even if you never
    pass `configMessages`.
  - When you add components under `src/config`, or change the Chinese text of `title` / `props`, add the matching English entries in `i18n.ts`
    and pass `configMessages` to `SvgEditor` (field list in section 12.1).

- Put svg files into `src/asset/svgs`; the file name must be the same as `config.name`.

- Put custom vue component files into `src/config/files`, then import them in `src/config/index.ts` and export them with `vueComp`. (The key under `vueComp` should be the same as the value of `tag` in the config file.)

- Pass the vue components to the editor and viewer with the `vueComp` prop. (Import the `vueComp` exported from `src/config/index.ts` at the usage site of the editor and viewer, and pass it to the editor and viewer components as the `vueComp` prop.)

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

- `src/config/i18n.ts` maps the component config data to English (group titles, component type names, property titles, select
  `label`s, custom animations, state options, ...). The complete list of translatable and non-translatable fields is in section 12.1.
  After copying `src/config/`, extend or modify it as needed and pass it to the editor via the `configMessages` prop; the built-in
  messages are used when it is omitted. Keys are the original Chinese text and the mapping only applies in English.

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
- PS: you have to install the `vite-plugin-svg-icons` plugin to append your svg to the html dom. (The install script in section 1 already includes this dependency, so a separate installation is generally not needed.)

### 6. How to use `vite-plugin-svg-icons`

- `npm i vite-plugin-svg-icons -D` or `pnpm add vite-plugin-svg-icons -D` (If you didn't follow the section 1 install script, run this command separately.)
- Change `vite.config.ts` (modify the project's vite config file)

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
             customDomId: '__svg__icons__dom__'//your id, do not use this id! (`__svg__icons__dom__` is the id used by the built-in svg files, so use your own id instead)
           })
         ],
         xxx
       })
       ```
  ````

- Change `main.ts` (modify the project's main file)

  ```
  // main.ts

  import 'virtual:svg-icons-register'
  ```

- PS: if there is an error `Cannot find module 'fast-glob'`, then run `npm i fast-glob -D` or `pnpm add fast-glob -D`.

### 7. Custom background for the editor and viewer

- This is a great feature: you can customize the background of the editor and viewer through their slots. You can put HTML elements into the slot and give them rich styles (various color combinations, gradients, grids, small decorations, etc.), or use an image as the background by setting a background image on the element or by placing an image directly.

 ```
  // editor

  <SvgEditor :data="xxx" slotBackground @onPreview="previewHandle">
	<template #background>
	  <div style="height: 100%; width: 100%; background-color: red"></div>
	</template>
  </SvgEditor>
  
  //Note: when using the custom background feature, pass `true` to the editor's `slotBackground` prop so that the "background color" feature in the "Canvas" panel is hidden, avoiding the impression that "the background color setting does not work".
 ```
 ```
  // viewer

  <SvgViewer :data="xxx">
	<template #background>
	  <div style="height: 100%; width: 100%; background-color: red"></div>
	</template>
  </SvgViewer>
 ```

### 8. Performance-related configuration

   > Both `SvgEditor` and `SvgViewer` have built-in performance tiering, with `level: 'auto'` as the default for automatic device performance detection. The detection logic is based on CPU core count, memory size and device pixel ratio, classifying devices into `high` / `medium` / `low` tiers, so low-end PCs and industrial computers can also run smoothly.

#### 8.1 Editor Performance Configuration `editorPerf`

   ```
     <SvgEditor :data="xxx" :editorPerf="{...}"/>
   ```

   > Configurable items of `editorPerf`:

   | Field | Type | Description |
   | --- | --- | --- |
   | `level` | `'auto' \| 'high' \| 'medium' \| 'low'` | Performance tier, defaults to `'auto'` (automatic detection) |
   | `animations` | `boolean` | Whether to enable CSS animations (animate.css / common-ani) |
   | `fpsLimit` | `number` | Maximum frame rate for interactions such as dragging/zooming; `<=0` means unlimited |
   | `clipThreshold` | `number` | Component count threshold that triggers viewport clipping — beyond this limit only nodes in the visible area are rendered |

   > Editor default strategy per tier:

   | Tier | `animations` | `fpsLimit` | `clipThreshold` | Description |
   | --- | --- | --- | --- | --- |
   | `high` | ✅ | 60 | 400 | Full effects, suitable for high-performance PCs |
   | `medium` | ❌ | 30 | 200 | Disables animations, lowers frame rate, enables clipping earlier; suitable for mid-range PCs |
   | `low` | ❌ | 20 | 100 | Most conservative strategy — freezes canvas visuals during drag/zoom and jumps to the final position once interaction ends, avoiding intermediate layout recalculations; suitable for older PCs and industrial computers |

   > The editor's `forceLevel` prop can force a specific tier (overrides `editorPerf.level`).

#### 8.2 Viewer Performance Configuration `previewPerf`

   ```
     <SvgViewer :data="xxx" :previewPerf="{...}"/>
   ```

   > Configurable items of `previewPerf`:

   | Field | Type | Description |
   | --- | --- | --- |
   | `level` | `'auto' \| 'high' \| 'medium' \| 'low'` | Performance tier, defaults to `'auto'` (automatic detection) |
   | `animations` | `boolean` | Whether to enable component animations (animate.css class animations) |
   | `chartAutoResize` | `boolean` | Whether charts are redrawn automatically when their size changes (recommended to turn off on low-end devices) |
   | `minChartInterval` | `number` | Minimum interval for chart data refresh (ms) |
   | `fpsLimit` | `number` | Maximum frame rate for interactions such as dragging/zooming; `<=0` means unlimited |
   | `nodeVirtual` | `boolean` | Whether to enable viewport-based virtual rendering (render only components in the visible area) |
   | `nodeVirtualThreshold` | `number` | Component count threshold that triggers viewport-based virtual rendering |

   > Viewer default strategy per tier: `high` enables all effects; `medium` disables automatic chart redraw and limits the frame rate to 30; `low` additionally disables animations, limits the frame rate to 20, and freezes canvas visuals during drag/zoom, jumping to the final position once interaction ends.
   > You can also use the `forceLevel` prop alone to force a tier. Custom vue components can read the currently effective performance configuration via `inject('previewPerf')` and degrade themselves accordingly.

### 9. MQTT communication

 - There are two ways to configure MQTT communication:
  > Option 1. Pass the configuration through the editor's `mqtt` prop, e.g.:
  ```
    <SvgEditor :mqtt="{cover:true,url:'xxx',user:'xxx',pwd:'xxx',topics:'xxx'}">
    // cover: whether to use this configuration to override the configuration of the Communication panel (i.e. the second option described below). When `true`, it overrides.
              Generally, if you configure here, the Communication panel does not need to be configured again, so you usually pass `true` here.
              Of course, if you only want to use this configuration as a fallback — i.e. use the Communication panel's configuration when the user has configured it there — pass `false`.
  ```
  > Option 2. Configure the MQTT url, username, password and topics under the "Communication" menu on the right side of the editor. Note: turn off the "external configuration" option in the Communication panel so that an independent configuration can be made and take effect.
- Listen to the `onMessage` event emitted by the viewer at the place where the viewer is used, and handle the returned data `{ topics, message }`.
- `message` can be parsed into an object with `JSON.parse` (the MQTT message content pushed from the backend to the frontend needs to be in JSON format).
- After receiving the message, you can update the UI with the `setNodeAttrByID` method.
- The `id` parameter of `setNodeAttrByID` can be found in `done_json` of the `props.data` passed to this component (the user passes it in, so the value is naturally known).
  > Two options for finding a specific component:
  > 1. Replace the id generated by the editor with the unique SVG component identifier agreed between the frontend and backend in your project (it must be unique), then call `setNodeAttrByID` to change the component's attributes.
  > 2. If you do not want to change the id (to avoid editor malfunctions caused by not guaranteeing the uniqueness of manually modified ids), you can add a field to the `props` of the configuration file of the component you want to change — for example `deviceCode` (there is a commented example in the `svg-text` config file). Then, while editing the configuration, fill in the corresponding `deviceCode` for the component (this creates a mapping between `deviceCode` and the component id) and save it. When the backend pushes MQTT messages to the frontend, include the specified `deviceCode`. In the frontend preview, after receiving the MQTT message, find the component id in `done_json` using the `deviceCode` in the message (you can use vue's `computed` to compute a mapping between `deviceCode` and id and store it in an object, so that when you need an id you can get it directly from the computed object by `deviceCode`), and then use `setNodeAttrByID` to change the component's attributes.

### 10. Event handling

- Components in the editor support event handling. First, when a component is selected, you can add events (one or more) under the "Events" menu on the right.
- After adding an event, you can choose the event type, behavior and condition (the condition is optional).
- The event type is the trigger type. Currently there are "click" and "value change": click is triggered when the component is clicked; value change is triggered when the component emits an `on-change` event to the outside (usually only custom vue components have this capability).
- The event behavior is the action executed after the event fires. Currently there are "modify attribute", "execute JavaScript" and "emit event".
- Modify attribute changes the attributes of itself and other components (other components require specifying an id). You need to specify the key to change and the value to set; multiple attributes can be changed at once.
- Execute JavaScript runs the entered js code.
- Emit event makes the viewer emit an `on-event` event to the outside, passing `{event, target}` data: `event` is the detailed data of the current event, and `target` is the detailed data of the current component.
- The condition is an extra condition for event triggering. Currently there is "relational operation", i.e. the event can be triggered when the component's own attributes satisfy the given selection.

### 11. Example

- Download [VGCE](https://github.com/RickyHeaven/VGCE.git)
- `pnpm i` or `npm i` (install dependencies)
- `pnpm dev` or `npm run dev` (run the project; usage examples are in the two pages under `src/views`)

### 12. i18n

- Chinese and English are built in, with Chinese as the default. Both `SvgEditor` and `SvgViewer` accept a `locale` prop (`'zh-CN'` | `'en-US'`).
- You can also call `setLocale('en-US')` at any time to switch globally, read the current language with `getLocale()`, or get a read-only reactive ref via `useVgceLocale()`.
- Texts in custom components can use `translate(key)`, where `key` is the original Chinese text and falls back to the key itself when no translation exists; `t` is an alias of `translate`.

```vue
<script setup lang="ts">
	import { SvgEditor, setLocale, translate } from '@zhangqingcq/vgce'

	// switch to English globally
	setLocale('en-US')

	// get a text inside a custom component
	const label = translate('保存')
</script>

<template>
	<!-- can also be set via prop; the component watches changes -->
	<SvgEditor locale="en-US" />
</template>
```

#### 12.1 i18n of the component config data (`src/config`)

The component config data under `src/config` lives in the **data layer**, so it cannot follow the language switch by itself. It uses a
"mapping table keyed by the original Chinese text" instead:

- In Chinese, `translate()` returns the original text and the mapping table is not applied, so the config data stays Chinese and readable.
- In English, the text is replaced by the mapped value; when there is no match it falls back to the original text (never blank, never an error).
- The mapping table is maintained by you and is not hard-coded inside the library. After copying `src/config/` you can extend or trim it freely.

**Translatable fields** (rendered through `translate()` inside the editor):

| Field | Where it shows | Note |
| --- | --- | --- |
| `IConfigComponentGroup.title` | Group title in the left component panel | Group name such as `'静态SVG'`, `'VUE组件'` |
| `IConfigItem.title` | Tooltip of the component in the left panel | Component **type** name such as `'按钮'`, `'饼图'` |
| `IConfigItem.props[key].title` | Label of the property form in the right panel | Property name such as `'宽度'`, `'背景颜色'` |
| `IConfigItem.props[key].options[].label` | Display text of the select options in the right panel | Only `label` is translated; `value` is the real value and **must not** be translated |
| `IConfigItem.animations[key].title` and `.options[].label` | Custom animations in the right panel (e.g. connection line animation type) | Title and options of custom animations |
| `IConfigItem.state[key].label` | "State" select in the right panel | State options of stateful components |

> If these fields are already in English (for example a `state` `label` written as `'Normal'`), no mapping is needed — `translate()` returns them as is.

**Fields that are not translated** (identifiers or business data; translating them breaks functionality or semantics):

| Field | Reason |
| --- | --- |
| `IConfigItem.name` | Must match the svg file name under `src/asset/svgs` |
| `IConfigItem.tag` | Must match the component key in `vueComp` |
| `IConfigItem.type`, `groupType`, `config` | Enum values / logic config, internal only |
| `IConfigItem.props[key].val` | Real component data (button text, device code, ...), business content |
| `IConfigItem.props[key].options[].value` | Real option value; translating it breaks data matching |
| Instance `title` | See below |

**About the instance `title`**: when a component is dropped onto the canvas, `IConfigItem.title` is written into the data model as its
initial name (`done_json[].title`). This field is the **instance name** the user relies on to identify components (e.g. renaming two
buttons to "Start" and "Stop"), therefore:

- The title input in the "Appearance" panel and the component tree in the "Structure" panel show the **raw value without translation**,
  so what the user sees always equals what is saved.
- As a result, in English the default name of a newly dropped component is still the Chinese key from the config. Rename it in the
  "Appearance" panel when you need an English name, or write `title` in the config in English directly.

**How to plug it in** (same pattern as `customToolbar`: provided by you, the library never reads files from your project):

```ts
// src/config/i18n.ts — English mapping keyed by the original Chinese text
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

- You can also call the exported `registerMessages(messages, target?)` at any time; `target` defaults to `'en-US'`.
- Without `configMessages`, the built-in mapping (covering the built-in components) is used; when provided, it is merged with the built-in
  mapping and your entries win for the same key.
- The mapping only affects what the editor UI displays. The original values in `data` are untouched, so saved and exported data models stay Chinese.

**Dynamic text inside canvas components** (e.g. the weekday, month and date format of `now-time`):

Such text is computed by the component at runtime, so a "Chinese source → English" mapping table cannot cover it. It lives in
`configLocaleText` of `i18n.ts`, maintained per language:

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

The component itself **never imports the library source**. It reads the current locale via `inject(configLocaleKey)`
(the editor and the viewer already `provide` it on the canvas layer), then uses `formatConfigDate()` / `getConfigWeekday()`:

```ts
// src/config/files/now-time.vue
import { computed, inject, ref } from 'vue'
import { configLocaleKey, formatConfigDate, getConfigWeekday } from '../i18n'

const locale = inject(configLocaleKey, ref('zh-CN'))
const date = computed(() => formatConfigDate(now_date.value, locale.value))
const week = computed(() => getConfigWeekday(now_date.value, locale.value))
```

As a result, the whole `src/config/` folder depends on no export of the library after copying, and every localized string can be edited
in `i18n.ts`. If your own components also render dynamic text, read `configLocaleKey` the same way and extend `configLocaleText`.

### Notes

- This library uses the `element-plus` UI framework, so you need to install element-plus in your project, using the version given above.
- If you do not use element-plus components anywhere else, you do not need to import element-plus in full.
- If you use only a few of its components, you can also use on-demand imports or manual imports.
- If your project uses another UI framework, the styles of the editor's element-plus components may be affected by that framework. However, since the editor uses only a few components and there will be no large-scale interference, you can write your own styles to fix the affected editor styles.
- If your project uses another UI framework, there is no need to worry about element-plus polluting the components of other UI frameworks in your project, because the editor does not require importing element-plus in full.