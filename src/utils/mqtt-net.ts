import { connect } from 'mqtt/dist/mqtt'
import type { MqttClient, PacketCallback } from 'mqtt'

class Link {
	client: MqttClient | null

	constructor() {
		this.client = null
	}

	sub(url: string, user: string, pwd: string, topics: string, callback: any) {
		const _url = url.trim()
		if (!/^wss?:\/\/.*$/.test(_url)) {
			console.error('编辑器MQTT通信只支持ws协议 (url必须以"ws://"开头)')
			return false
		}
		this.client = connect(_url, {
			username: user.trim(),
			password: pwd.trim(),
			reconnectPeriod: 600000 /*如果连不上，10分钟后重试*/
		})

		this.client?.on('connect', () => {
			console.log('MQTT服务器连接成功')
			console.log(this.client?.options.clientId)
			this.client?.subscribe(topics, { qos: 1 })
		})

		this.client?.on('message', callback)
	}

	pub(url: string, user: string, pwd: string, topics: string, data: any, callback: PacketCallback) {
		const _url = url.trim()
		if (!/^wss?:\/\/.*$/.test(_url)) {
			console.error('编辑器MQTT通信只支持ws协议 (url必须以"ws://"开头)')
			return false
		}
		this.client = connect(_url, {
			username: user.trim(),
			password: pwd.trim()
		})

		this.client?.on('connect', () => {
			console.log('MQTT服务器连接成功')
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
		this.client?.end?.(true, {}, () => {
			console.log('MQTT服务连接关闭')
			callback?.()
		})
	}

	destroy() {
		this.client = null
	}
}

const t = function () {
	return new Link()
}

export default t
