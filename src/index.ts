/**
 * @description 库vgce入口
 * @author Ricky email:zhangqingcq@foxmail.com
 * @created 2023.04.27
 */
import type { App } from 'vue'

import SvgEditor from '@/components/svg-editor/index.vue'
import SvgViewer from '@/components/svg-viewer/index.vue'

import 'virtual:windi.css'
import 'virtual:svg-icons-register'
import '@/assets/main.less'

const install = function (app: App, options: Record<string, any> = {}) {
	app.component('SvgEditor', SvgEditor)
	app.component('SvgViewer', SvgViewer)
}

export default { install }
