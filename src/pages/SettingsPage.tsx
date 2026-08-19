import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, User, Lock, Save } from 'lucide-react'
import { authApi } from '../api'

export default function SettingsPage() {
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState<any>({})
    const [realName, setRealName] = useState('')
    const [department, setDepartment] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [infoMsg, setInfoMsg] = useState('')
    const [pwdMsg, setPwdMsg] = useState('')
    const [infoLoading, setInfoLoading] = useState(false)
    const [pwdLoading, setPwdLoading] = useState(false)

    useEffect(() => {
        loadInfo()
    }, [])

    const loadInfo = async () => {
        try {
            const res = await authApi.info()
            if (res.success) {
                setDoctor(res.result)
                setRealName(res.result.realName || '')
                setDepartment(res.result.department || '')
                setPhone(res.result.phone || '')
                setEmail(res.result.email || '')
            }
        } catch {}
    }

    const handleUpdateInfo = async () => {
        setInfoLoading(true)
        setInfoMsg('')
        try {
            const res = await authApi.updateInfo({ realName, department, phone, email })
            if (res.success) {
                setInfoMsg('Profile updated successfully')
                localStorage.setItem('doctor', JSON.stringify(res.result))
                setTimeout(() => navigate(-1), 1500)
            } else {
                setInfoMsg(res.message)
            }
        } catch (err: any) {
            setInfoMsg(err.response?.data?.message || 'Update failed')
        } finally {
            setInfoLoading(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (!oldPassword || !newPassword) {
            setPwdMsg('Please fill in all fields')
            return
        }
        if (newPassword !== confirmPassword) {
            setPwdMsg('New passwords do not match')
            return
        }
        setPwdLoading(true)
        setPwdMsg('')
        try {
            const res = await authApi.updatePassword(oldPassword, newPassword)
            if (res.success) {
                setPwdMsg('Password updated successfully')
                setOldPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setTimeout(() => navigate(-1), 1500)
            } else {
                setPwdMsg(res.message)
            }
        } catch (err: any) {
            setPwdMsg(err.response?.data?.message || 'Update failed')
        } finally {
            setPwdLoading(false)
        }
    }

    const inputClass = "w-full text-xs py-2.5 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40"

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Settings size={18} className="text-blue-400" />
                <p className="text-base font-medium text-slate-200">Settings</p>
            </div>

            <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden mb-4">
                <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-2">
                    <User size={14} className="text-blue-400" />
                    <span className="text-xs font-medium text-slate-400">Personal Information</span>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Username</label>
                        <input type="text" value={doctor.username || ''} disabled
                               className={`${inputClass} opacity-50 cursor-not-allowed`} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Real Name</label>
                        <input type="text" value={realName} onChange={(e) => setRealName(e.target.value)}
                               className={inputClass} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Department</label>
                        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                               className={inputClass} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                               className={inputClass} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               className={inputClass} />
                    </div>
                    {infoMsg && (
                        <p className={`text-xs ${infoMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>{infoMsg}</p>
                    )}
                    <button onClick={handleUpdateInfo} disabled={infoLoading}
                            className="text-xs py-2.5 px-6 rounded-lg border-none text-white font-medium cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                        <Save size={14} /> {infoLoading ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>

            <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-2">
                    <Lock size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-slate-400">Change Password</span>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Current Password</label>
                        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                               className={inputClass} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                               className={inputClass} />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                               className={inputClass} />
                    </div>
                    {pwdMsg && (
                        <p className={`text-xs ${pwdMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>{pwdMsg}</p>
                    )}
                    <button onClick={handleUpdatePassword} disabled={pwdLoading}
                            className="text-xs py-2.5 px-6 rounded-lg border-none text-white font-medium cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                        <Lock size={14} /> {pwdLoading ? 'Updating...' : 'Update password'}
                    </button>
                </div>
            </div>
        </div>
    )
}