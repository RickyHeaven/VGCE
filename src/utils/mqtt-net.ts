import * as mqttModule from 'mqtt/dist/mqtt'
import type { MqttClient, PacketCallback } from 'mqtt'
import { translate } from '@/i18n'

//mqtt/dist/mqtt 是 browserify 打包的 UMD 产物（带 __esModule 标记但无 default 导出），
//dev、ESM、UMD、Node 严格 ESM 四种场景下拿到的层级不同，这里统一取到真正含 connect 的模块对象
const mqttLib: typeof import('mqtt') = mqttModule.default ?? mqttModule
const connect = mqttLib.connect

class Link {
	client: MqttClient | null

	constructor() {
		this.client = null
	}

	sub(url: string, user: string, pwd: string, topics: string, callback: any) {
		const _url = url.trim()
		if (!/^wss?:\/\/.*$/.test(_url)) {
			console.error(translate('编辑器MQTT通信只支持ws协议 (url必须以"ws://"开头)'))
			return false
		}
		this.client = connect(_url, {
			username: user.trim(),
			password: pwd.trim(),
			reconnectPeriod: 120000 /*如果连不上，2分钟后重试*/
		})

		this.client?.on('connect', () => {
			console.log(translate('MQTT服务器连接成功'))
			console.log(this.client?.options.clientId)
			this.client?.subscribe(topics, { qos: 1 })
		})

		this.client?.on('message', callback)
	}

	pub(url: string, user: string, pwd: string, topics: string, data: any, callback: PacketCallback) {
		const _url = url.trim()
		if (!/^wss?:\/\/.*$/.test(_url)) {
			console.error(translate('编辑器MQTT通信只支持ws协议 (url必须以"ws://"开头)'))
			return false
		}
		this.client = connect(_url, {
			username: user.trim(),
			password: pwd.trim()
		})

		this.client?.on('connect', () => {
			console.log(translate('MQTT服务器连接成功'))
			console.log(this.client?.options.clientId)
			this.client?.publish(
				topics,
				JSON.stringify(data),
				{
					qos: 0,
					retain: true
				},
				callback
			)
		})
	}

	close(callback?: () => void) {
		const client = this.client
		if (!client) {
			callback?.()
			return
		}
		//先移除监听，避免断开过程中仍触发业务回调
		client.removeAllListeners()
		//断开是异步握手，可能在极端情况下不回调，因此用兜底定时器保证最终释放
		let done = false
		const finish = () => {
			if (done) {
				return
			}
			done = true
			console.log(translate('MQTT服务连接关闭'))
			this.client = null
			callback?.()
		}
		try {
			client.end(true, {}, finish)
		} catch (e) {
			finish()
		}
		setTimeout(finish, 1000)
	}

	destroy() {
		this.client?.removeAllListeners()
		this.client = null
	}
}

const t = function () {
	return new Link()
}

export default t