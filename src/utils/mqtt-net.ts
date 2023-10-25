import { connect } from 'mqtt/dist/mqtt'
import type { MqttClient, PacketCallback } from 'mqtt'

let client: MqttClient

export const sub = (url: string, user: string, pwd: string, topics: string, callback: Function) => {
	client = connect(url, {
		username: user,
		password: pwd,
		reconnectPeriod: 600000 /*如果连不上，10分钟后重试*/
	})

	client.on('connect', () => {
		console.log('MQTT服务器连接成功')
		console.log(client.options.clientId)
		client.subscribe(topics, { qos: 1 })
	})

	client.on('message', callback)
}

export const pub = (url: string, user: string, pwd: string, topics: string, data: any, callback: PacketCallback) => {
	client = connect(url, {
		username: user,
		password: pwd
	})

	client.on('connect', () => {
		console.log('MQTT服务器连接成功')
		console.log(client.options.clientId)
		client.publish(
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

export const close = () => {
	if (client && client.end) {
		client.end(true, {}, () => {
			console.log('MQTT服务连接关闭')
		})
	}
}
