import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import {resolve} from 'path'
import WindiCSS from 'vite-plugin-windicss';
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), vueJsx(), WindiCSS(), createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [
        resolve(process.cwd(), 'src/assets/svgs'), resolve(process.cwd(), 'src/assets/icons')
      ], // 指定symbolId格式
      symbolId: 'svg-[name]', // 禁用压缩 否则想要修改无状态组件的stroke或者fill会影响到预设样式 例如stroke-width
      svgoOptions: false,
      customDomId: '__webtopo__svgedit__icons__dom__'
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
})
