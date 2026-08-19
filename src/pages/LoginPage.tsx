import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cpu } from 'lucide-react'
import { authApi } from '../api'

export default function LoginPage() {
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [realName, setRealName] = useState('')
    const [department, setDepartment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter username and password')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await authApi.login(username, password)
            if (res.success) {
                localStorage.setItem('accessToken', res.result.accessToken)
                localStorage.setItem('refreshToken', res.result.refreshToken)
                localStorage.setItem('doctor', JSON.stringify({ username, realName: username }))
                navigate('/dashboard')
            } else {
                setError(res.message)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        if (!username || !password) {
            setError('Please enter username and password')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await authApi.register(username, password, realName, department)
            if (res.success) {
                setIsLogin(true)
                setError('')
                alert('Registration successful, please login')
            } else {
                setError(res.message)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const switchMode = () => {
        setIsLogin(!isLogin)
        setError('')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLogin) {
            handleLogin()
        } else {
            handleRegister()
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-[#131825]"
            style={{
                backgroundImage: 'radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, #131825 70%)',
            }}
        >
            <div className="w-80 text-center">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                >
                    <Cpu size={24} className="text-white" />
                </div>
                <p className="text-base font-medium text-slate-200 mb-1">MedReport AI</p>
                <p className="text-xs text-slate-400 mb-5">
                    Intelligent chest X-ray analysis platform
                </p>

                <div className="bg-white/[0.06] border border-white/[0.12] rounded-xl p-5">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40 mb-2"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40 mb-2"
                        />

                        {!isLogin && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Real name"
                                    value={realName}
                                    onChange={(e) => setRealName(e.target.value)}
                                    className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40 mb-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40 mb-2"
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-400 mb-2">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-xs py-2.5 rounded-lg border-none text-white font-medium cursor-pointer disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
                        </button>
                    </form>

                    <p className="text-[11px] text-slate-400 mt-3">
                        {isLogin ? 'New user? ' : 'Already have an account? '}
                        <span className="text-blue-400 cursor-pointer" onClick={switchMode}>
              {isLogin ? 'Create account' : 'Sign in'}
            </span>
                    </p>
                </div>
            </div>
        </div>
    )
}