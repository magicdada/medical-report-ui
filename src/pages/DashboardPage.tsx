import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users,
    FileText,
    AlertCircle,
    TrendingUp,
    Plus,
    Clock,
} from 'lucide-react'
import { statsApi, reportApi } from '../api'
import type { Report } from '../types'

export default function DashboardPage() {
    const navigate = useNavigate()
    const [overview, setOverview] = useState<any>(null)
    const [monthly, setMonthly] = useState<any[]>([])
    const [disease, setDisease] = useState<any[]>([])
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [efficiency, setEfficiency] = useState<any>(null)
    const doctor = JSON.parse(localStorage.getItem('doctor') || '{}')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [overviewRes, monthlyRes, diseaseRes, reportRes, efficiencyRes] = await Promise.allSettled([
                statsApi.overview(),
                statsApi.monthly(),
                statsApi.disease(),
                reportApi.getMine(),
                statsApi.efficiency(),
            ])
            if (overviewRes.status === 'fulfilled' && overviewRes.value.success) setOverview(overviewRes.value.result)
            if (monthlyRes.status === 'fulfilled' && monthlyRes.value.success) setMonthly(monthlyRes.value.result || [])
            if (diseaseRes.status === 'fulfilled' && diseaseRes.value.success) setDisease(diseaseRes.value.result || [])
            if (reportRes.status === 'fulfilled' && reportRes.value.success) setReports(reportRes.value.result || [])
            if (efficiencyRes.status === 'fulfilled' && efficiencyRes.value.success) setEfficiency(efficiencyRes.value.result)
        } catch (err) {
            console.error('Failed to load data', err)
        } finally {
            setLoading(false)
        }
    }

    const statusColor = (status: string) => {
        if (status === 'DRAFT') return 'bg-amber-400/10 text-amber-400 border-amber-400/15'
        if (status === 'CONFIRMED') return 'bg-blue-400/10 text-blue-400 border-blue-400/15'
        return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/15'
    }

    const diseaseColors = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']

    const maxMonthly = Math.max(...monthly.map(m => m.count), 1)

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-base font-medium text-slate-200">
                        Welcome back, {doctor.realName || doctor.username || 'Doctor'}
                    </p>
                    <p className="text-xs text-slate-400">Workspace overview</p>
                </div>
                <button
                    onClick={() => navigate('/diagnosis')}
                    className="text-xs py-2 px-4 rounded-lg border-none text-white font-medium cursor-pointer flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                >
                    <Plus size={14} /> New diagnosis
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-blue-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total patients</span>
                    </div>
                    <p className="text-2xl font-medium text-blue-400">{overview?.totalPatients ?? 0}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total reports</span>
                    </div>
                    <p className="text-2xl font-medium text-slate-200">{overview?.totalReports ?? 0}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={14} className="text-amber-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Pending review</span>
                    </div>
                    <p className="text-2xl font-medium text-amber-400">{overview?.draftCount ?? 0}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">AI accuracy</span>
                    </div>
                    <p className="text-2xl font-medium text-emerald-400">{overview?.accuracy ?? 0}%</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Monthly report volume</span>
                        <span className="text-[10px] text-slate-400">Last 6 months</span>
                    </div>
                    <div className="p-4">
                        <div className="flex items-end gap-2 h-24">
                            {monthly.map((d, i) => (
                                <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
                                    <div
                                        className="w-full rounded-t"
                                        style={{
                                            height: `${maxMonthly > 0 ? (d.count / maxMonthly) * 100 : 0}%`,
                                            minHeight: d.count > 0 ? '4px' : '0px',
                                            background: i === monthly.length - 1
                                                ? 'linear-gradient(180deg, #7c3aed, #2563eb)'
                                                : 'linear-gradient(180deg, #3b82f6, #2563eb)',
                                        }}
                                    />
                                    <span className={`text-[9px] ${i === monthly.length - 1 ? 'text-blue-400' : 'text-slate-400'}`}>
                    {d.month}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Disease distribution</span>
                        <span className="text-[10px] text-slate-400">This month</span>
                    </div>
                    <div className="p-4">
                        {disease.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
                        ) : (
                            disease.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2 mb-2 text-[11px] text-slate-400">
                                    <div className="w-2 h-2 rounded-sm" style={{ background: diseaseColors[i] || '#6b7280' }} />
                                    <span className="flex-1">{d.name}</span>
                                    <span className="text-slate-400">{d.percent}%</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.08]">
                        <span className="text-xs font-medium text-slate-400">AI efficiency gain</span>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="text-center">
                                <p className="text-[9px] text-slate-400 mb-1">Avg. report time (before)</p>
                                <p className="text-lg font-medium text-slate-400">{efficiency?.avgTimeBefore ?? 0} min</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] text-slate-400 mb-1">Avg. report time (with AI)</p>
                                <p className="text-lg font-medium text-emerald-400">{efficiency?.avgTimeWithAi ?? 0} min</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-xl font-medium text-emerald-400">{efficiency?.improvementPercent ?? 0}%</span>
                            <span className="text-[10px] text-slate-400 ml-1">faster</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Recent reports</span>
                        <span className="text-[10px] text-blue-400 cursor-pointer" onClick={() => navigate('/reports')}>View all</span>
                    </div>
                    {reports.length === 0 ? (
                        <div className="p-4 text-center">
                            <Clock size={20} className="text-slate-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">No reports yet</p>
                        </div>
                    ) : (
                        reports.slice(0, 5).map((report) => (
                            <div
                                key={report.id}
                                className="flex items-center px-4 py-2.5 border-b border-white/[0.06] last:border-b-0 text-xs"
                            >
                                <span className="flex-1 text-slate-200">{report.patientName}</span>
                                <span className="w-16 text-slate-400">
                  {new Date(report.createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                                <span className="w-24 text-right">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}