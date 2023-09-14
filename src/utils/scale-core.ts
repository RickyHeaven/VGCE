import { calculateRotatedPointCoordinate, getCenterPoint } from '.'
import type { IScalePoint } from './types'
/**
 * 左上角缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @returns
 */
export const calculateLeftTop = (curPosition: IScalePoint, symmetricPoint: IScalePoint, rotate: number) => {
	//新的中心点坐标
	const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
	const newTopLeftPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -rotate)
	const newBottomRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)

	return {
		width: newBottomRightPoint.x - newTopLeftPoint.x,
		height: newBottomRightPoint.y - newTopLeftPoint.y,
		is_old_width: false,
		is_old_height: false
	}
}
/**
 * 右上角缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @returns
 */
export const calculateRightTop = (curPosition: IScalePoint, symmetricPoint: IScalePoint, rotate: number) => {
	const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
	const newTopRightPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -rotate)
	const newBottomLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)

	return {
		width: newTopRightPoint.x - newBottomLeftPoint.x,
		height: newBottomLeftPoint.y - newTopRightPoint.y,
		is_old_width: false,
		is_old_height: false
	}
}
/**
 * 右下角缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @returns
 */
export const calculateRightBottom = (curPosition: IScalePoint, symmetricPoint: IScalePoint, rotate: number) => {
	const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
	const newTopLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)
	const newBottomRightPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -rotate)

	return {
		width: newBottomRightPoint.x - newTopLeftPoint.x,
		height: newBottomRightPoint.y - newTopLeftPoint.y,
		is_old_width: false,
		is_old_height: false
	}
}
/**
 * 左下角缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @returns
 */
export const calculateLeftBottom = (curPosition: IScalePoint, symmetricPoint: IScalePoint, rotate: number) => {
	const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
	const newTopRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -rotate)
	const newBottomLeftPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -rotate)

	return {
		width: newTopRightPoint.x - newBottomLeftPoint.x,
		height: newBottomLeftPoint.y - newTopRightPoint.y,
		is_old_width: false,
		is_old_height: false
	}
}
/**
 * 顶点中心缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @param curPoint
 * @returns
 */
export const calculateTop = (
	curPosition: IScalePoint,
	symmetricPoint: IScalePoint,
	rotate: number,
	curPoint: IScalePoint
) => {
	const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -rotate)
	const rotatedTopMiddlePoint = calculateRotatedPointCoordinate(
		{
			x: curPoint.x,
			y: rotatedCurPosition.y
		},
		curPoint,
		rotate
	)
	const newHeight = Math.sqrt(
		(rotatedTopMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedTopMiddlePoint.y - symmetricPoint.y) ** 2
	)
	return {
		width: 1,
		height: Math.round(newHeight),
		is_old_width: true,
		is_old_height: false
	}
}
/**
 * 右侧中心缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @param curPoint
 * @returns
 */
export const calculateRight = (
	curPosition: IScalePoint,
	symmetricPoint: IScalePoint,
	rotate: number,
	curPoint: IScalePoint
) => {
	const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -rotate)
	const rotatedRightMiddlePoint = calculateRotatedPointCoordinate(
		{
			x: rotatedCurPosition.x,
			y: curPoint.y
		},
		curPoint,
		rotate
	)

	const newWidth = Math.sqrt(
		(rotatedRightMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedRightMiddlePoint.y - symmetricPoint.y) ** 2
	)

	return {
		width: Math.round(newWidth),
		height: 1,
		is_old_width: false,
		is_old_height: true
	}
}
/**
 * 底部中心缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @returns
 */
export const calculateBottom = (
	curPosition: IScalePoint,
	symmetricPoint: IScalePoint,
	rotate: number,
	curPoint: IScalePoint
) => {
	const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -rotate)
	const rotatedBottomMiddlePoint = calculateRotatedPointCoordinate(
		{
			x: curPoint.x,
			y: rotatedCurPosition.y
		},
		curPoint,
		rotate
	)

	const newHeight = Math.sqrt(
		(rotatedBottomMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedBottomMiddlePoint.y - symmetricPoint.y) ** 2
	)

	return {
		width: 1,
		height: Math.round(newHeight),
		is_old_width: true,
		is_old_height: false
	}
}
/**
 * 左侧中心缩放
 * @param curPosition 按住的缩放按钮的坐标
 * @param symmetricPoint 缩放前对称点的坐标
 * @param rotate 旋转角度
 * @returns
 */
export const calculateLeft = (
	curPosition: IScalePoint,
	symmetricPoint: IScalePoint,
	rotate: number,
	curPoint: IScalePoint
) => {
	const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, curPoint, -rotate)
	const rotatedLeftMiddlePoint = calculateRotatedPointCoordinate(
		{
			x: rotatedCurPosition.x,
			y: curPoint.y
		},
		curPoint,
		rotate
	)

	const newWidth = Math.sqrt(
		(rotatedLeftMiddlePoint.x - symmetricPoint.x) ** 2 + (rotatedLeftMiddlePoint.y - symmetricPoint.y) ** 2
	)

	return {
		width: Math.round(newWidth),
		height: 1,
		is_old_width: false,
		is_old_height: true
	}
}
