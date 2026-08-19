import axios from 'axios'

const request = axios.create({
    baseURL: '/api',
    timeout: 60000,
})

// 刷新状态
let isRefreshing = false
let pendingRequests: ((token: string) => void)[] = []

request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers['accessToken'] = token
        }
        return config
    },
    (error) => Promise.reject(error)
)

request.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        if (error.response?.status === 403) {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
                localStorage.removeItem('accessToken')
                window.location.href = '/login'
                return Promise.reject(error)
            }

            // 已经在刷新中，排队等待
            if (isRefreshing) {
                return new Promise((resolve) => {
                    pendingRequests.push((newToken: string) => {
                        error.config.headers['accessToken'] = newToken
                        resolve(request(error.config))
                    })
                })
            }

            isRefreshing = true
            try {
                const res = await axios.get(`/api/auth/refresh/${refreshToken}`)
                if (res.data.success) {
                    const newToken = res.data.result.accessToken
                    localStorage.setItem('accessToken', newToken)
                    localStorage.setItem('refreshToken', res.data.result.refreshToken)

                    // 重发排队的请求
                    pendingRequests.forEach(cb => cb(newToken))
                    pendingRequests = []

                    // 重发当前请求
                    error.config.headers['accessToken'] = newToken
                    return request(error.config)
                }
            } catch {
                // 刷新失败
            } finally {
                isRefreshing = false
            }

            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default request