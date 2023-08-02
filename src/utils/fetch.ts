/**
 * @description 基于axios的网络请求插件
 * @author Ricky email:zhangqingcq@foxmail.com
 * @created 2023.06.21
 */
import { isEmpty } from 'lodash-es'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Collection } from './types'

// const host = window.location.origin
const host = 'http://localhost:6789'

interface RequestConfigR extends AxiosRequestConfig {
	spin?: boolean
	noEmptyStr?: boolean
}

// 创建自定义对象
let service: AxiosInstance = axios.create({
	baseURL: host,
	withCredentials: true // 允许携带cookie
})

/**
 * 拦截器，在发起请求前调用
 */
service.interceptors.request.use(
	(q) => {
		return q
	},
	(e) => {
		return Promise.reject(e)
	}
)

/**
 * 封装请求结果和错误处理
 */
function checkResult(r: Partial<AxiosResponse>, msg?: string, rPath?: string[], config?: RequestConfigR) {
	let y = true
	let d = r && r.data
	if (d) {
		rPath = rPath ? rPath : []
		for (let e of rPath) {
			d = d[e]
			y = y && d
		}
		if (y) {
			return d
		}
		msg && console.warn(msg)
		return false
	}
	msg && console.warn(msg)
	return false
}

function handleRequest(
	method: string,
	url: string,
	data?: Collection,
	msg?: string,
	rPath?: string[],
	config?: RequestConfigR,
	isUrlData?: boolean
) {
	return new Promise((s, j) => {
		switch (method) {
			case 'get':
				service
					.get(url, { params: data })
					.then((r) => {
						let d = checkResult(r, msg, rPath, config)
						if (d) {
							s(d)
						} else {
							j(r)
						}
					})
					.catch((e) => {
						checkResult({}, msg, rPath, config)
						j(e)
					})
				break
			case 'delete':
				let keyT = isUrlData ? 'params' : 'data'
				service
					.delete(url, { [keyT]: data })
					.then((r) => {
						let d = checkResult(r, msg, rPath, config)
						if (d) {
							s(d)
						} else {
							j(r)
						}
					})
					.catch((e) => {
						checkResult({}, msg, rPath, config)
						j(e)
					})
				break
			case 'post':
				service
					.post(url, data, config)
					.then((r) => {
						let d = checkResult(r, msg, rPath, config)
						if (d) {
							s(d)
						} else {
							j(r)
						}
					})
					.catch((e) => {
						checkResult({}, msg, rPath, config)
						j(e)
					})
				break
			case 'put':
				service
					.put(url, data, config)
					.then((r) => {
						let d = checkResult(r, msg, rPath, config)
						if (d) {
							s(d)
						} else {
							j(r)
						}
					})
					.catch((e) => {
						checkResult({}, msg, rPath, config)
						j(e)
					})
				break
			default:
		}
	})
}

/**
 * 检查请求传入的各个参数
 * @param method 请求方法
 * @param url 地址
 * @param data 餐宿
 * @param msg 错误信息
 * @param rPath 返回数据路径（提取）
 * @param config 请求配置
 * @param isUrlData delete方法传参模式 true:params,false:data
 * @returns {Promise<*>}
 */
function checkRequest(
	method: string,
	url: string,
	data: Collection = {},
	msg?: string,
	rPath?: string[],
	config?: RequestConfigR,
	isUrlData?: boolean
) {
	return new Promise((s, j) => {
		if (url) {
			let data_: Collection | undefined
			if (config && config.headers && config.headers['Content-Type'] === 'multipart/form-data') {
				data_ = data
			} else {
				if (data && !isEmpty(data)) {
					if (Array.isArray(data)) {
						data_ = []
						for (let e of data) {
							if (e || e === 0 || e === false || (e === '' && config && !config.noEmptyStr)) {
								data_.push(e)
							}
						}
					} else {
						data_ = {}
						for (let key in data) {
							if (
								data.hasOwnProperty(key) &&
								(data[key] ||
									data[key] === 0 ||
									data[key] === false ||
									(data[key] === '' && config && !config.noEmptyStr))
							) {
								data_[key] = data[key]
							}
						}
					}
				}
			}
			let method_ = method.toLowerCase()
			handleRequest(method_, url, data_, msg, rPath, config, isUrlData)
				.then((r) => {
					s(r)
				})
				.catch((e) => {
					j(e)
				})
		} else {
			console.error('没有请求地址:url')
			j('没有请求地址:url')
		}
	})
}

/**
 * @description 基于axios封装的请求插件，引入库时使用this.$fetch时直接调用以下方法，例如：this.$fetch.get("/getData",{id:1})，
 * vue3的setup模式使用：proxy调用
 * 单独引入时遵循Es Modules规范即可
 * @class
 */
export default {
	/**
	 * post 请求
	 * @function
	 * @param {string} url 请求地址
	 * @param {object} data 请求数据
	 * @param {string} msg 错误信息，在控制台输出，方便调试，不用可以不传，例如：
	 * @example this.$fetch.post("/getDataB",{name:'ricky'},"获取数据B失败")
	 * @param {Array.<string>} rPath 请求结果提取路径，如：[data,list]表示data.list,如不需过滤可不传
	 * @param {object} config 请求配置  如请求过程需要遮罩层，设置 spin:true即可
	 * @return {Promise<object>}
	 * @example this.$fetch.post("/getData",{id:1},null,['result','list'])
	 *  .then(r=>{
	 *      console.log(r)
	 *      r相当于:data.result.list,data是网络请求结果
	 *  })
	 *
	 * 注意：
	 *  请求最多支持5个入参，最少一个(url)，依次为：url,data,msg,rPath,config。如果要传靠后的入参，但不想传前面的，应该这样传：
	 *  this.$fetch.post("/setData",{},null,[],{
	 *     headers: {
	 *         'Content-Type': 'multipart/form-data'
	 *       },
	 *       spin:true
	 *   }
	 *  )
	 */
	post(url: string, data?: Collection, msg?: string, rPath?: string[], config?: RequestConfigR) {
		return new Promise((s, j) => {
			checkRequest('post', url, data, msg, rPath, config)
				.then((r) => {
					s(r)
				})
				.catch((e) => {
					j(e)
				})
		})
	},
	/**
	 * put请求
	 * @param {string} url 请求地址
	 * @param {object} data 请求数据
	 * @param {string} msg 错误信息，在控制台输出，方便调试，不用可以不传
	 * @param {Array.<string>} rPath 请求结果提取路径
	 * @param {object} config 请求配置  如请求过程需要遮罩层，设置 spin:true即可
	 * @return {Promise<unknown>}
	 */
	put(url: string, data?: Collection, msg?: string, rPath?: string[], config?: RequestConfigR) {
		return new Promise((s, j) => {
			checkRequest('put', url, data, msg, rPath, config)
				.then((r) => {
					s(r)
				})
				.catch((e) => {
					j(e)
				})
		})
	},
	/**
	 * get请求
	 * @param {string} url 请求地址
	 * @param {object} data 请求数据
	 * @param {string} msg 错误信息，在控制台输出，方便调试，不用可以不传
	 * @param {Array.<string>} rPath 请求结果提取路径
	 * @param {object} config 请求配置  如请求过程需要遮罩层，设置 spin:true即可
	 * @return {Promise<unknown>}
	 * PS: get请求时(delete请求同理)，可以把请求参数写在url里，也可以写在data里，注意写在data里时，data是对象
	 * 以请求'/devices',找到id=2,name=meter举例：
	 *  只传url时，url = '/devices?id=2&name=meter'
	 *  url和data都传时,url = '/devices',data={id:2,name:'meter'}
	 */
	get(url: string, data?: Collection, msg?: string, rPath?: string[], config?: RequestConfigR) {
		return new Promise((s, j) => {
			checkRequest('get', url, data, msg, rPath, config)
				.then((r) => {
					s(r)
				})
				.catch((e) => {
					j(e)
				})
		})
	},
	/**
	 * delete 请求
	 * @param {string} url 请求地址
	 * @param {object} data 请求数据
	 * @param {string} msg 错误信息，在控制台输出，方便调试，不用可以不传
	 * @param {Array.<string>} rPath 请求结果提取路径
	 * @param {object} config 请求配置  如请求过程需要遮罩层，设置 spin:true即可
	 * @param isUrlData 传参模式 true:params,false:data
	 * @return {Promise<unknown>}
	 */
	delete(
		url: string,
		data?: Collection,
		msg?: string,
		rPath?: string[],
		config?: RequestConfigR,
		isUrlData: boolean = true
	) {
		return new Promise((s, j) => {
			checkRequest('delete', url, data, msg, rPath, config, isUrlData)
				.then((r) => {
					s(r)
				})
				.catch((e) => {
					j(e)
				})
		})
	},
	/**
	 * 并发请求   例如：
	 * @example this.$fetch.all(
	 *  [
	 *    this.$fetch.get("/getData"),
	 *    this.$fetch.post("/getDataB",{name:'ricky'})
	 *  ]
	 * )
	 */
	all: axios.all,
	/**
	 * 并发请求结果分离 例如：
	 * @example this.$fetch.all(
	 *  [
	 *    this.$fetch.get("/getData"),
	 *    this.$fetch.post("/getDataB",{name:'ricky'})
	 *  ]
	 * )
	 *  .then(
	 *    this.$fetch.spread((result1,result2)=>{
	 *        console.log(result1,result2)
	 *    })
	 *   )
	 */
	spread: axios.spread,
	/**
	 * 该请求插件暴露给外界的配置对象，为axios.create创建的实例对象，使用方法见axios官方网站
	 */
	config: service
}
