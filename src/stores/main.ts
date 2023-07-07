import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('main', () => {
	const dataModel = ref()

	return {
		dataModel
	}
})
