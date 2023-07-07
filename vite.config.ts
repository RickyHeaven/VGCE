import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { resolve } from 'path'
import WindiCSS from 'vite-plugin-windicss'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		WindiCSS(),
		createSvgIconsPlugin({
			// 指定需要缓存的图标文件夹
			iconDirs: [resolve(process.cwd(), 'src/assets/svgs'), resolve(process.cwd(), 'src/assets/icons')], // 指定symbolId格式
			symbolId: 'svg-[name]', // 禁用压缩 否则想要修改无状态组件的stroke或者fill会影响到预设样式 例如stroke-width
			svgoOptions: false,
			customDomId: '__svg__icons__dom__'
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
			entry: resolve(__dirname, 'src/export.ts'),
			name: 'VGCE',
			fileName: `vgce`
		},
		rollupOptions: {
			// 确保外部化处理那些你不想打包进库的依赖
			external: [
				'vue',
				'pinia',
				'echarts',
				'element-plus',
				'ace-builds',
				'vue-echarts',
				'vue-router',
				'vue3-ace-editor'
			],
			output: {
				// 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
				globals: {
					vue: 'Vue',
					pinia: 'Pinia',
					'element-plus': 'elementPlus',
					'vue-echarts': 'VChart',
					'vue3-ace-editor': 'vue3AceEditor',
					'ace-builds': 'ace$1'
				},
				inlineDynamicImports: true
			}
		},
		copyPublicDir: false
	}
})
