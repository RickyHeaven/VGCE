import fetch from '@/utils/fetch'

export const login = () => {
	fetch
		.post('/login')
		.then((r) => {
			console.log(r)
		})
		.catch((e) => {})
}
