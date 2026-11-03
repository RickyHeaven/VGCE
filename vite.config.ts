import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import WindiCSS from 'vite-plugin-windicss'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
	server: { hmr: { overlay: false } },
	plugins: [
		vue(),
		vueJsx(),
		WindiCSS(),
		createSvgIconsPlugin({
			// 指定需要缓存的图标文件夹
			iconDirs: [
				fileURLToPath(new URL('./src/assets/svgs', import.meta.url)),
				fileURLToPath(new URL('./src/assets/icons', import.meta.url))
			],
			symbolId: 'svg-[name]', // 指定symbolId格式
			svgoOptions: false, // 禁用压缩 否则想要修改无状态组件的stroke或者fill会影响到预设样式 例如stroke-width
			customDomId: '__svg__icons__dom__'
		}),
		AutoImport({
			// targets to transform
			include: [
				/\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
				/\.vue$/,
				/\.vue\?vue/, // .vue
				/\.md$/ // .md
			],

			// global imports to register
			imports: [
				// presets
				'vue',
				'vue-router', // custom
				{
					pinia: [
						// default imports
						'createPinia',
						'defineStore'
					],
					'vue3-ace-editor': [
						// default imports
						'VAceEditor'
					],
					axios: [
						// default imports
						['default', 'axios'] // import { default as axios } from 'axios',
					]
					/*'[package-name]': [
					 '[import-names]',
					 // alias
					 ['[from]', '[alias]'],
					 ],*/
				}, // example type import
				{
					from: 'vue-router',
					imports: ['RouteLocationRaw'],
					type: true
				}
			], // Enable auto import by filename for default module exports under directories
			defaultExportByFilename: false,

			// Auto import for module exports under directories
			// by default it only scan one level of modules under the directory
			dirs: [
				// './hooks',
				// './composables' // only root modules
				// './composables/**', // all nested modules
				// ...
			],

			// Filepath to generate corresponding .d.ts file.
			// Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
			// Set `false` to disable.
			dts: './auto-imports.d.ts',

			// Auto import inside Vue template
			// see https://github.com/unjs/unimport/pull/15 and https://github.com/unjs/unimport/pull/72
			vueTemplate: false,

			// Custom resolvers, compatible with `unplugin-vue-components`
			// see https://github.com/antfu/unplugin-auto-import/pull/23/
			resolvers: [],

			// Inject the imports at the end of other imports
			injectAtEnd: true
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
				rewriteUrls: 'all'
			}
		}
	},
	build: {
		lib: {
			entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
			name: 'VGCE',
			fileName: `vgce`
		},
		rollupOptions: {
			// 确保外部化处理那些你不想打包进库的依赖
			// 用正则匹配子路径，避免 element-plus/es 这类深层引入绕过 external 把整包打进产物
			// 例外：?url 等资源导入必须交给 vite 内联，否则资源路径会失效
			external: (id: string) => {
				if (id.includes('?')) return false
				// 库的 element-plus 样式需要内联进 dist/style.css，保证宿主只引一次样式即可开箱即用
				if (id === 'element-plus/dist/index.css') return false
				return /^(vue|pinia|element-plus|ace-builds|lodash-es|vue-echarts|echarts|mqtt)(\/.*)?$/.test(id)
			},
			output: {
				// 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
				// echarts、mqtt 的引入分散在子路径（如 echarts/core、mqtt/dist/mqtt），故用函数统一映射到各自全局变量
				globals: (id: string) => {
					if (id === 'vue') return 'Vue'
					if (id === 'pinia') return 'Pinia'
					if (id === 'element-plus') return 'elementPlus'
					if (id === 'lodash-es') return 'lodashEs'
					if (id === 'ace-builds') return 'ace'
					if (id === 'vue-echarts') return 'VChart'
					if (id.startsWith('echarts')) return 'echarts'
					if (id.startsWith('mqtt')) return 'mqtt'
					return id
				},
				inlineDynamicImports: true
			}
		},
		copyPublicDir: false
	}
})