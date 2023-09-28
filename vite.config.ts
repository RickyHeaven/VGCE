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
					'@vueuse/core': [
						// named imports
						'useMouse', // import { useMouse } from '@vueuse/core',
						// alias
						['useFetch', 'useMyFetch'] // import { useFetch as useMyFetch } from '@vueuse/core',
					],
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
			external: ['vue', 'pinia', 'element-plus', 'ace-builds', 'lodash-es', 'vue-echarts', 'animate.css'],
			output: {
				// 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
				globals: {
					vue: 'Vue',
					pinia: 'Pinia'
				},
				inlineDynamicImports: true
			}
		},
		copyPublicDir: false
	}
})
