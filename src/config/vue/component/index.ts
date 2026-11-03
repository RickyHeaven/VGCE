import type { IConfigComponentGroup } from '../../types'

import vButton from './button'
import common_table from './common-table'
import now_time from './now-time'
import vTag from './tag'
import progress_a from './progress'
import textBox from './text-box'

const t: IConfigComponentGroup = {
	groupType: 'custom-vue',
	title: 'VUE组件',
	list: [vButton, progress_a, common_table, now_time, vTag, textBox]
}
export default t