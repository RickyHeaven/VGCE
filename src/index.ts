/**
 * @description 库vgce入口
 * @author Ricky email:zhangqingcq@foxmail.com
 * @created 2023.07.10
 */

import 'virtual:windi.css'
import 'virtual:svg-icons-register'
import './assets/main.less'

export { default as SvgEditor } from '@/components/svg-editor/index.vue'
export { default as SvgViewer } from '@/components/svg-viewer.vue'
export { EPreviewPerfLevel, detectPerfLevel } from '@/utils/perf'
export type { IPreviewPerfOptions } from '@/utils/perf'
export { EDoneJsonType } from '@/config/types'
export { setLocale, getLocale, translate, t, useVgceLocale, registerMessages, normalizeLocale, DEFAULT_LOCALE } from '@/i18n'
export type { VgceLocale } from '@/i18n'