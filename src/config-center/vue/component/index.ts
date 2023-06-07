import type { IConfigComponentGroup } from '@/config-center/types'

import { el_button } from './button'
import { common_table } from './common-table'
import { now_time } from './now-time'
import { el_tag } from './tag'

export const components: IConfigComponentGroup = {
	groupType: 'custom-vue',
	title: 'VUE组件',
	list: [el_button,common_table, now_time,el_tag]
}
