import type { IConfigComponentGroup } from '../types'
import components from './component'
import echarts_group from './echarts'

const t: IConfigComponentGroup[] = Object.seal([components, echarts_group])
export default t
