import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    ScanLine,
    Users,
    FileText,
    GitCompareArrows,
    Settings,
    LogOut,
    Cpu,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { authApi } from '../api'

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/diagnosis', icon: ScanLine, label: 'Diagnosis' },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/comparison', icon: GitCompareArrows, label: 'Comparison' },
]

export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        try {
            await authApi.logout()
        } catch {}
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('doctor')
        navigate('/login')
    }

    const [doctor, setDoctor] = useState<any>(JSON.parse(localStorage.getItem('doctor') || '{}'))

    useEffect(() => {
        const loadDoctorInfo = async () => {
            try {
                const res = await authApi.info()
                if (res.success) {
                    setDoctor(res.result)
                    localStorage.setItem('doctor', JSON.stringify(res.result))
                }
            } catch {}
        }
        loadDoctorInfo()
    }, [])

    return (
        <div className="flex h-screen bg-[#131825] text-white overflow-hidden">
            {/* 侧边栏 */}
            <aside className="w-[56px] bg-[#0f1420] border-r border-white/[0.08] flex flex-col items-center py-3 gap-2">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <Cpu size={18} />
                </div>

                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        title={item.label}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            location.pathname === item.path
                                ? 'bg-blue-500/[0.12] text-blue-400'
                                : 'text-slate-500 hover:text-slate-400'
                        }`}
                    >
                        <item.icon size={18} />
                    </button>
                ))}

                <div className="flex-1" />

                <button
                    onClick={() => navigate('/settings')}
                    title="Settings"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        location.pathname === '/settings'
                            ? 'bg-blue-500/[0.12] text-blue-400'
                            : 'text-slate-500 hover:text-slate-400'
                    }`}
                >
                    <Settings size={18} />
                </button>
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400"
                >
                    <LogOut size={18} />
                </button>
            </aside>

            {/* 主内容区 */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* 顶栏 */}
                <header className="h-11 bg-[#161d2e] border-b border-white/[0.1] flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">MedReport AI</span>
                    </div>
                    <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                {doctor.realName || doctor.username || 'Online'}
            </span>
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                        >
                            {doctor.realName?.charAt(0) || 'D'}
                        </div>
                    </div>
                </header>

                {/* 页面内容 */}
                <main className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}