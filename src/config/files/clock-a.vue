<script lang="ts" setup>
	const props = withDefaults(
		defineProps<{
			id: string
			centerColor: string
			secondsColor: string
			circleColor: string
			minutesColor: string
			hoursColor: string
			scaleColor: string
			backgroundColor: string
			borderColor: string
		}>(),
		{
			id: '',
			centerColor: '#EBF257',
			secondsColor: '#E83E24',
			circleColor: '#F45AFC',
			minutesColor: '#50E68E',
			hoursColor: '#9A36E7',
			scaleColor: '#4942CF',
			backgroundColor: '#ffffff',
			borderColor: '#B3A7FF'
		}
	)
	const nowTime = new Date(Number(window.sessionStorage.getItem('editorLoadTime') || '0'))
	const s = nowTime.getSeconds() + 1
	const m = nowTime.getMinutes()
	const h = Math.floor((nowTime.getHours() + (m + s / 60) / 60) * 30)
</script>
<template>
	<g :id="props.id">
		<symbol :id="`${props.id}clock-a-n`" viewBox="0 0 1024 1024">
			<path d="M512.3 518.9m-469.2 0a469.2 469.2 0 1 0 938.4 0 469.2 469.2 0 1 0-938.4 0Z" :fill="props.borderColor" />
			<path d="M512.3 518.9m-392.5 0a392.5 392.5 0 1 0 785 0 392.5 392.5 0 1 0-785 0Z" :fill="props.backgroundColor" />
			<path
				d="M512.3 523.8c-4.5 0-9-1.7-12.4-5.1L318.3 337.1c-6.8-6.8-6.8-17.9 0-24.8 6.8-6.8 17.9-6.8 24.8 0L524.7 494c6.8 6.8 6.8 17.9 0 24.8-3.5 3.3-7.9 5-12.4 5z"
				:fill="props.minutesColor"
			>
				<animateTransform
					attributeName="transform"
					attributeType="XML"
					type="rotate"
					:from="`${45 + m * 6} 512.3 506.3`"
					:to="`${405 + m * 6} 512.3 506.3`"
					dur="3600s"
					repeatCount="indefinite"
				/>
			</path>
			<path
				d="M512.3 523.8c-4.5 0-9-1.7-12.4-5.1-6.8-6.8-6.8-17.9 0-24.8l130.8-130.8c6.8-6.8 17.9-6.8 24.8 0 6.8 6.8 6.8 17.9 0 24.8L524.7 518.7c-3.5 3.4-7.9 5.1-12.4 5.1z"
				:fill="props.hoursColor"
			>
				<animateTransform
					attributeName="transform"
					attributeType="XML"
					type="rotate"
					:from="`${-45 + h} 512.3 506.3`"
					:to="`${315 + h} 512.3 506.3`"
					dur="43200s"
					repeatCount="indefinite"
				/>
			</path>
			<path d="M512.3 506.3m-47.5 0a47.5 47.5 0 1 0 95 0 47.5 47.5 0 1 0-95 0Z" :fill="props.circleColor" />
			<path
				d="M512.3 218.8c-9 0-16.3-7.3-16.3-16.3v-29.1c0-9 7.3-16.3 16.3-16.3s16.3 7.3 16.3 16.3v29.1c0 9-7.4 16.3-16.3 16.3zM512.3 880.8c-9 0-16.3-7.3-16.3-16.3v-29.1c0-9 7.3-16.3 16.3-16.3s16.3 7.3 16.3 16.3v29.1c0 9-7.4 16.3-16.3 16.3zM812.4 518.9c0-9 7.3-16.3 16.3-16.3h29.1c9 0 16.3 7.3 16.3 16.3s-7.3 16.3-16.3 16.3h-29.1c-8.9 0-16.3-7.3-16.3-16.3zM150.4 518.9c0-9 7.3-16.3 16.3-16.3h29.1c9 0 16.3 7.3 16.3 16.3s-7.3 16.3-16.3 16.3h-29.1c-8.9 0-16.3-7.3-16.3-16.3z"
				:fill="props.scaleColor"
			/>
			<path
				d="M296.9 733.5c-2.2 0-4.5-0.9-6.2-2.6-3.4-3.4-3.4-9 0-12.4L540 469.2c3.4-3.4 9-3.4 12.4 0 3.4 3.4 3.4 9 0 12.4L303.1 731c-1.7 1.7-4 2.5-6.2 2.5z"
				:fill="props.secondsColor"
			>
				<animateTransform
					attributeName="transform"
					attributeType="XML"
					type="rotate"
					:from="`${135.5 + s * 6} 512.3 506.3`"
					:to="`${495.5 + s * 6} 512.3 506.3`"
					dur="60s"
					repeatCount="indefinite"
				/>
			</path>
			<path d="M512.3 506.3m-22.8 0a22.8 22.8 0 1 0 45.6 0 22.8 22.8 0 1 0-45.6 0Z" :fill="props.centerColor" />
		</symbol>
		<use :xlink:href="`#${props.id}clock-a-n`" width="100" height="100" />
	</g>
</template>
