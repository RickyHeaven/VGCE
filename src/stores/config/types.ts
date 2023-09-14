export interface IPositionCenter {
	svg: IPositionCenterSvg
}

export interface IPositionCenterSvg {
	background_color: string
	scale: number
	grid: boolean
	ruler: boolean
}

export interface INet {
	mqtt: {
		url: string
		user: string
		pwd: string
		topics: string
	}
}
