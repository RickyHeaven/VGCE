import type { IConfigComponentGroup } from '@/config/types'

import el_button from './button'
import common_table from './common-table'
import now_time from './now-time'
import el_tag from './tag'
import progress_a from './progress'
import textBox from './text-box'

const t: IConfigComponentGroup = {
	groupType: 'custom-vue',
	title: 'VUE组件',
	list: [el_button, progress_a, common_table, now_time, el_tag, textBox]
}
export default t
