import {EConfigItemPropsType, EDoneJsonType} from '@/config-center/types'
import type {IConfigItem} from '@/config-center/types'

export const light_a: IConfigItem = {
  name: 'light',
  tag: 'light-a',
  title: '灯',
  type: EDoneJsonType.CustomSvg,
  config: {
    can_zoom: true,
    have_anchor: true,
    actual_rect: true
  },
  display: true,
  props: {
    isOpen: {
      title: '开关',
      type: EConfigItemPropsType.Switch,
      val: false
    }
  },
  common_animations: {
    val: '',
    delay: 'delay-0s',
    speed: 'slow',
    repeat: 'infinite'
  }
}
