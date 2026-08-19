import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Search, FileText, X, Eye, Edit3, Check,
    FileDown, Sparkles, AlertTriangle, Shield,
} from 'lucide-react'
import { reportApi } from '../api'
import type { Report } from '../types'

export default function ReportPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [searchText, setSearchText] = useState('')
    const patientIdFromUrl = searchParams.get('patientId')

    // 弹窗相关
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [editMode, setEditMode] = useState(false)
    const [editContent, setEditContent] = useState('')

    useEffect(() => {
        loadReports()
    }, [])

    const loadReports = async () => {
        try {
            let res
            if (patientIdFromUrl) {
                res = await reportApi.getByPatient(patientIdFromUrl)
            } else {
                res = await reportApi.getMine()
            }
            if (res.success) setReports(res.result || [])
        } catch (err) {
            console.error('Failed to load reports', err)
        } finally {
            setLoading(false)
        }
    }

    // const openDetail = (report: Report) => {
    //     setSelectedReport(report)
    //     setEditContent(report.reportContent || '')
    //     setEditMode(false)
    // }
    const openDetail = async (report: Report) => {
        try {
            const res = await reportApi.getDetail(report.id)
            if (res.success) {
                setSelectedReport(res.result)
                setEditContent(res.result.reportContent || '')
                setEditMode(false)
            }
        } catch (err) {
            console.error('Failed to load detail', err)
        }
    }

    const closeDetail = () => {
        setSelectedReport(null)
        setEditMode(false)
    }

    const handleSaveEdit = async () => {
        if (!selectedReport) return
        try {
            const res = await reportApi.updateContent(selectedReport.id, editContent)
            if (res.success) {
                const updated = { ...selectedReport, reportContent: editContent }
                setSelectedReport(updated)
                setReports(reports.map(r => r.id === updated.id ? updated : r))
                setEditMode(false)
            }
        } catch (err) {
            console.error('Save failed', err)
        }
    }

    const handleUpdateStatus = async (status: string) => {
        if (!selectedReport) return
        try {
            const res = await reportApi.updateStatus(selectedReport.id, status)
            if (res.success) {
                const updated = { ...selectedReport, status }
                setSelectedReport(updated)
                setReports(reports.map(r => r.id === updated.id ? updated : r))
            }
        } catch (err) {
            console.error('Update status failed', err)
        }
    }

    const filteredReports = reports.filter((r) => {
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
        if (searchText) {
            const keyword = searchText.toLowerCase()
            return (r.patientName?.toLowerCase().includes(keyword) ||
                r.patientNo?.toLowerCase().includes(keyword) ||
                r.reportContent?.toLowerCase().includes(keyword))
        }
        return true
    })

    const statusColor = (status: string) => {
        if (status === 'DRAFT') return 'bg-amber-400/10 text-amber-400 border-amber-400/15'
        if (status === 'CONFIRMED') return 'bg-blue-400/10 text-blue-400 border-blue-400/15'
        return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/15'
    }

    const confidenceColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400'
        if (score >= 60) return 'text-amber-400'
        return 'text-red-400'
    }

    const getImagePaths = (imagePath: string) => {
        if (!imagePath) return []
        return imagePath.split(',').map(p => `/${p.trim()}`)
    }

    return (
        <div>
            {/* 顶部筛选 */}
            <div className="flex gap-2 mb-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs py-2.5 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-400 outline-none w-28"
                >
                    <option value="ALL">All</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SIGNED">Signed</option>
                </select>
                <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search patient or report..."
                        className="w-full text-xs py-2.5 pl-9 pr-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40"
                    />
                </div>
                {/*<button className="text-xs py-2 px-4 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-slate-200 flex items-center gap-1">*/}
                {/*    <Download size={14} /> Export*/}
                {/*</button>*/}
            </div>

            {patientIdFromUrl && (
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Filtered by patient:</span>
                    <span className="text-xs text-blue-400">{patientIdFromUrl}</span>
                    <button
                        onClick={() => navigate('/reports')}
                        className="text-[10px] text-slate-400 cursor-pointer bg-transparent border-none hover:text-slate-300"
                    >
                        Clear filter
                    </button>
                </div>
            )}

            {/* 报告列表 */}
            <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                <div className="flex items-center px-4 py-3 text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                    <span className="w-16">No</span>
                    <span className="flex-1">Patient</span>
                    <span className="w-20">Type</span>
                    <span className="w-36">Created</span>
                    <span className="w-36">Updated</span>
                    <span className="w-16">Date</span>
                    <span className="w-24">Status</span>
                    <span className="w-20">Conf.</span>
                    <span className="w-20">Action</span>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading...</div>
                ) : filteredReports.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText size={24} className="text-slate-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No reports found</p>
                    </div>
                ) : (
                    filteredReports.map((report) => {
                        const mockConfidence = Math.floor(Math.random() * 40) + 55
                        return (
                            <div
                                key={report.id}
                                className="flex items-center px-4 py-3 border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.015] text-xs cursor-pointer"
                                onClick={() => openDetail(report)}
                            >
                                <span className="w-16 text-slate-400">{report.patientNo}</span>
                                <span className="flex-1 text-slate-200">{report.patientName}</span>
                                <span className="w-20 text-slate-400">Chest X-ray</span>
                                <span className="w-36 text-slate-400">{report.createTime}</span>
                                <span className="w-36 text-slate-400">{report.updateTime || '—'}</span>
                                <span className="w-16 text-slate-400">
                                    {new Date(report.createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="w-24">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(report.status)}`}>
                                    {report.status}
                                </span>
                                </span>
                                <span className={`w-20 text-[10px] font-medium ${confidenceColor(mockConfidence)}`}>
                                    {mockConfidence}%
                                </span>
                                <span className="w-20">
                                 <button onClick={(e) => { e.stopPropagation(); openDetail(report) }} className="text-[10px] text-blue-400 cursor-pointer bg-transparent border-none hover:text-blue-300"
                                    >
                                        View
                                    </button>
                                </span>
                            </div>
                        )
                    })
                )}
            </div>

            {/* 报告详情弹窗 */}
            {selectedReport && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={closeDetail}
                >
                    <div
                        className="w-full max-w-2xl bg-[#1a2236] border border-white/[0.1] rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 弹窗头部 */}
                        <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-blue-400" />
                                <span className="text-sm font-medium text-slate-200">Report detail</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${statusColor(selectedReport.status)}`}>
                                    {selectedReport.status}
                                </span>
                                <button onClick={closeDetail} className="text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* 弹窗内容（可滚动） */}
                        <div className="overflow-y-auto p-5 space-y-4">
                            {/* 患者信息 */}
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>Patient: {selectedReport.patientName ? `${selectedReport.patientNo} — ${selectedReport.patientName}` : selectedReport.patientId}</span>
                                <span>|</span>
                                <span>{new Date(selectedReport.createTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>

                            {/* 影像预览 */}
                            <div className="grid grid-cols-2 gap-3">
                                {getImagePaths(selectedReport.imagePath).length > 0 ? (
                                    getImagePaths(selectedReport.imagePath).map((path, i) => (
                                        <div key={i}>
                                            <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: i === 0 ? '#60a5fa' : '#94a3b8' }}>
                                                {i === 0 ? 'Frontal' : 'Lateral'}
                                            </p>
                                            <img src={path} alt={i === 0 ? 'Frontal' : 'Lateral'} className="w-full h-32 object-contain rounded-lg bg-black/20" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 h-32 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">
                                        No images available
                                    </div>
                                )}
                            </div>

                            {/* GradCAM 热力图 */}
                            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-white/[0.08]">
                                    <span className="text-xs font-medium text-slate-400">GradCAM attention map</span>
                                </div>
                                <div className="p-3">
                                    <div className="h-28 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(59,130,246,0.06))' }}>
                                        <div className="text-center">
                                            <Eye size={18} className="text-violet-500 mx-auto mb-1" />
                                            <span className="text-[10px] text-violet-400">Model attention overlay</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-[8px]">
                                        <span className="text-blue-400">Low attention</span>
                                        <div className="flex-1 h-1 mx-2 mt-1 rounded" style={{ background: 'linear-gradient(90deg, #3b82f6, #22c55e, #eab308, #ef4444)' }} />
                                        <span className="text-red-400">High attention</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI 报告内容 */}
                            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-400">AI generated report</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-400 border border-violet-400/15 flex items-center gap-1">
                                        <Sparkles size={10} /> AI draft
                                    </span>
                                </div>
                                <div className="p-4">
                                    {editMode ? (
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full text-xs leading-relaxed text-slate-300 bg-transparent border border-white/[0.12] rounded-lg p-3 outline-none focus:border-blue-500/40 resize-none h-36"
                                        />
                                    ) : (
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-2">Findings</p>
                                            <p className="text-xs leading-relaxed text-slate-300 mb-3">{selectedReport.reportContent}</p>
                                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent my-3" />
                                            <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-2">Impression</p>
                                            <p className="text-xs leading-relaxed text-slate-300"></p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI 原稿对比（如果有修改） */}
                            {selectedReport.aiDraft && selectedReport.aiDraft !== selectedReport.reportContent && (
                                <div className="p-3 rounded-lg bg-amber-400/[0.04] border border-amber-400/10">
                                    <p className="text-[10px] text-amber-400 flex items-center gap-1 mb-2">
                                        <AlertTriangle size={12} /> Doctor modified the AI draft
                                    </p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{selectedReport.aiDraft}</p>
                                </div>
                            )}
                        </div>

                        {/* 操作按钮（固定底部） */}
                        <div className="px-5 py-3 border-t border-white/[0.08] flex gap-2 shrink-0">
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className="flex-1 text-xs py-2 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-center gap-1"
                            >
                                <Edit3 size={13} /> {editMode ? 'Cancel' : 'Edit'}
                            </button>
                            {editMode && (
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={!editContent.trim()}
                                    className="flex-1 text-xs py-2 rounded-lg border-none text-white font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                                >
                                    <Check size={13} /> Save
                                </button>
                            )}
                            {!editMode && (
                                <>
                                    {selectedReport.status === 'DRAFT' && (
                                        <button
                                            onClick={() => handleUpdateStatus('CONFIRMED')}
                                            className="flex-1 text-xs py-2 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-blue-400 flex items-center justify-center gap-1"
                                        >
                                            <Check size={13} className="text-blue-400" /> Confirm
                                        </button>
                                    )}
                                    {(selectedReport.status === 'DRAFT' || selectedReport.status === 'CONFIRMED') && (
                                        <button
                                            onClick={() => handleUpdateStatus('SIGNED')}
                                            className="flex-1 text-xs py-2 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-emerald-400 flex items-center justify-center gap-1"
                                        >
                                            <Shield size={13} className="text-emerald-400" /> Sign
                                        </button>
                                    )}
                                    <button
                                        onClick={() => reportApi.exportPdf(selectedReport.id)}
                                        className="flex-1 text-xs py-2 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-center gap-1"
                                    >
                                        <FileDown size={13} /> PDF
                                    </button>
                                    <button
                                        onClick={() => reportApi.exportWord(selectedReport.id)}
                                        className="flex-1 text-xs py-2 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-center gap-1"
                                    >
                                        <FileDown size={13} /> Word
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}