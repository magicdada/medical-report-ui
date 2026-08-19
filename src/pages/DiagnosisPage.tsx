import { useEffect, useState, useRef } from 'react'
import {
    CloudUpload,
    Sparkles,
    Eye,
    Edit3,
    Check,
    FileDown,
    AlertTriangle,
    Loader2,
} from 'lucide-react'
import { patientApi, reportApi } from '../api'
import type { Patient, Report } from '../types'

export default function DiagnosisPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatientId, setSelectedPatientId] = useState('')
    const [frontalFile, setFrontalFile] = useState<File | null>(null)
    const [lateralFile, setLateralFile] = useState<File | null>(null)
    const [frontalPreview, setFrontalPreview] = useState('')
    const [lateralPreview, setLateralPreview] = useState('')
    const [generating, setGenerating] = useState(false)
    const [progress, setProgress] = useState(0)
    const [progressText, setProgressText] = useState('')
    const [report, setReport] = useState<Report | null>(null)
    const [editMode, setEditMode] = useState(false)
    const [editContent, setEditContent] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const frontalRef = useRef<HTMLInputElement>(null)
    const lateralRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadPatients()
    }, [])

    const loadPatients = async () => {
        try {
            const res = await patientApi.list()
            if (res.success && res.result.length > 0) {
                setPatients(res.result)
                setSelectedPatientId(res.result[0].id)
            }
        } catch (err) {
            console.error('Failed to load patients', err)
        }
    }

    const handleFileSelect = (file: File, type: 'frontal' | 'lateral') => {
        const url = URL.createObjectURL(file)
        if (type === 'frontal') {
            setFrontalFile(file)
            setFrontalPreview(url)
        } else {
            setLateralFile(file)
            setLateralPreview(url)
        }
    }

    const handleSaveEdit = async () => {
        if (report && report.id !== 'demo') {
            try {
                const res = await reportApi.updateContent(report.id, editContent)
                if (res.success) {
                    setReport({ ...report, reportContent: editContent })
                    setEditMode(false)
                }
            } catch (err) {
                console.error('Save failed', err)
            }
        }
    }

    const handleDrop = (e: React.DragEvent, type: 'frontal' | 'lateral') => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file, type)
    }

    const handleGenerate = async () => {
        if (!selectedPatientId) {
            alert('Please select a patient')
            return
        }
        if (!frontalFile) {
            alert('Please upload a frontal chest X-ray')
            return
        }

        setGenerating(true)
        setProgress(0)
        setReport(null)
        setErrorMsg('')

        const steps = [
            { text: 'Uploading image...', progress: 15 },
            { text: 'Extracting visual features...', progress: 35 },
            { text: 'Analyzing with R2GenGPT...', progress: 60 },
            { text: 'Generating report...', progress: 85 },
        ]

        for (const step of steps) {
            setProgressText(step.text)
            setProgress(step.progress)
            await new Promise((r) => setTimeout(r, 800))
        }

        try {
            const files: File[] = [frontalFile]
            if (lateralFile) {
                files.push(lateralFile)
            }
            const res = await reportApi.generate(selectedPatientId, files)
            if (res.success) {
                setReport(res.result)
                setEditContent(res.result.reportContent || '')
                setProgress(100)
                setProgressText('Report generated successfully!')
            } else {
                setProgressText('Generation failed: ' + res.message)
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'AI service unavailable, please try again later')
            setReport(null)
            setProgress(0)
        } finally {
            setGenerating(false)
        }
    }

    const handleSign = async () => {
        if (report && report.id !== 'demo') {
            try {
                await reportApi.updateStatus(report.id, 'SIGNED')
                setReport({ ...report, status: 'SIGNED' })
            } catch (err) {
                console.error('Sign failed', err)
            }
        }
    }

    return (
        <div>
            {/* 患者选择 */}
            <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden mb-3">
                <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Patient</span>
                </div>
                <div className="p-3">
                    <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none"
                    >
                        <option value="">Select patient</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.patientNo} — {p.name} ({p.gender}, {p.age})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 双槽位上传 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Frontal */}
                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Frontal chest X-ray</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/15 flex items-center gap-1">
              <Sparkles size={10} /> AI input
            </span>
                    </div>
                    <div className="p-4">
                        {frontalPreview ? (
                            <div className="relative">
                                <img src={frontalPreview} alt="Frontal" className="w-full h-40 object-contain rounded-lg bg-black/20" />
                                <button
                                    onClick={() => { setFrontalFile(null); setFrontalPreview('') }}
                                    className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-black/50 text-white border-none cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div
                                className="border-[1.5px] border-dashed border-blue-500/25 rounded-xl p-5 text-center bg-blue-500/[0.02] cursor-pointer"
                                onClick={() => frontalRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, 'frontal')}
                            >
                                <CloudUpload size={24} className="text-blue-500 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">Drop frontal X-ray here</p>
                                <p className="text-[10px] text-slate-400 mt-1">Required — used for AI analysis</p>
                                <p className="text-[9px] text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                            </div>
                        )}
                        <input ref={frontalRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'frontal')} />
                    </div>
                </div>

                {/* Lateral */}
                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Lateral chest X-ray</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/15">Optional</span>
                    </div>
                    <div className="p-4">
                        {lateralPreview ? (
                            <div className="relative">
                                <img src={lateralPreview} alt="Lateral" className="w-full h-40 object-contain rounded-lg bg-black/20" />
                                <button
                                    onClick={() => { setLateralFile(null); setLateralPreview('') }}
                                    className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-black/50 text-white border-none cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div
                                className="border-[1.5px] border-dashed border-slate-500/20 rounded-xl p-5 text-center bg-slate-500/[0.02] cursor-pointer"
                                onClick={() => lateralRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, 'lateral')}
                            >
                                <CloudUpload size={24} className="text-slate-400 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">Drop lateral X-ray here</p>
                                <p className="text-[10px] text-slate-400 mt-1">Improves AI accuracy when paired with frontal</p>
                                <p className="text-[9px] text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                            </div>
                        )}
                        <input ref={lateralRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'lateral')} />
                    </div>
                </div>
            </div>

            {/* 生成按钮 + 进度条 */}
            <button
                onClick={handleGenerate}
                disabled={generating || !frontalFile}
                className="w-full text-xs py-2.5 rounded-lg border-none text-white font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 mb-3"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            >
                {generating ? (
                    <span className="flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Generating...</span>
                ) : (
                    <span className="flex items-center gap-1"><Sparkles size={14} /> Generate report{lateralFile ? ' (frontal + lateral)' : ' (frontal only)'}</span>
                )}
            </button>

            {generating && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 text-[10px] text-violet-400 mb-1">
                        <Loader2 size={12} className="animate-spin" /> {progressText}
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }}
                        />
                    </div>
                </div>
            )}
            {errorMsg && (
                <div className="mb-3 bg-red-400/[0.08] border border-red-400/20 rounded-xl p-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                    <span className="text-xs text-red-400">{errorMsg}</span>
                </div>
            )}

            {/* 结果区域 */}
            {report && (
                <div className="grid grid-cols-2 gap-3">
                    {/* 左侧 */}
                    <div>
                        {/* 影像预览 */}
                        <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden mb-3">
                            <div className="px-4 py-2.5 border-b border-white/[0.08]">
                                <span className="text-xs font-medium text-slate-400">Image preview</span>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[9px] text-blue-400 uppercase tracking-wider mb-1">Frontal</p>
                                    {frontalPreview ? (
                                        <img src={frontalPreview} alt="Frontal" className="w-full h-28 object-contain rounded-lg bg-black/20" />
                                    ) : (
                                        <div className="h-28 rounded-lg bg-white/[0.055] border border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">No image</div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Lateral</p>
                                    {lateralPreview ? (
                                        <img src={lateralPreview} alt="Lateral" className="w-full h-28 object-contain rounded-lg bg-black/20" />
                                    ) : (
                                        <div className="h-28 rounded-lg bg-white/[0.055] border border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">No image</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 热力图 + Findings 分析 */}
                        {(() => {
                            const gate = report.gate
                            const findings = report.findingsKeywords ? JSON.parse(report.findingsKeywords) : []
                            const heatmaps = report.heatmapPath ? JSON.parse(report.heatmapPath) : []

                            // 情况2 normal态：无异常，不显示热力图
                            if (gate === 'normal') {
                                return (
                                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Check size={14} className="text-emerald-400" />
                                            <span className="text-xs font-medium text-emerald-400">Normal Study</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            No significant findings detected. No attention heatmap is generated for normal studies.
                                        </p>
                                    </div>
                                )
                            }

                            // 情况1 findings态 + 情况3 uncertain态
                            return (
                                <div className="space-y-3">
                                    {/* 检测到的疾病（findings态） */}
                                    {findings.length > 0 && (
                                        <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                                            <div className="px-4 py-2.5 border-b border-white/[0.08]">
                                                <span className="text-xs font-medium text-slate-400">Detected Findings</span>
                                            </div>
                                            <div className="p-4">
                                                {findings.map((f: any, i: number) => (
                                                    <div key={i} className="mb-2.5 last:mb-0">
                                                        <div className="flex justify-between text-[10px] mb-1">
                                                            <span className="text-slate-300 flex items-center gap-1">
                                                                <AlertTriangle size={10} className="text-red-400" />
                                                                {f.label || f.keyword}
                                                            </span>
                                                            <span className="font-medium text-red-400">
                                                                {Math.round((f.confidence || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full bg-red-400"
                                                                 style={{ width: `${(f.confidence || 0) * 100}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* uncertain态提示 */}
                                    {gate === 'uncertain' && (
                                        <div className="bg-amber-400/[0.06] border border-amber-400/15 rounded-xl p-3">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-amber-400" />
                                                <span className="text-xs text-amber-400">Uncertain findings — manual review recommended</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 热力图 */}
                                    {heatmaps.length > 0 && heatmaps.map((hm: any, i: number) => (
                                        <div key={i} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                                            <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-400">
                                                    {hm.view === 'frontal' ? 'Frontal' : 'Lateral'}
                                                    {hm.type === 'finding' ? ` — ${hm.word}` : ' — Overall Attention'}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-400 border border-violet-400/15">
                                                    {hm.type === 'finding' ? 'Finding Map' : 'Attention Map'}
                                                </span>
                                            </div>
                                            <div className="p-3">
                                                <img src={`data:image/png;base64,${hm.overlay}`} alt={`${hm.view} ${hm.word}`}
                                                     className="w-full h-auto rounded-lg" />
                                                <div className="flex justify-between mt-2 text-[8px]">
                                                    <span className="text-blue-400">Low attention</span>
                                                    <div className="flex-1 h-1 mx-2 mt-1 rounded" style={{ background: 'linear-gradient(90deg, #3b82f6, #22c55e, #eab308, #ef4444)' }} />
                                                    <span className="text-red-400">High attention</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Image Contribution */}
                                    {report.reportConfidence != null && (
                                        <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl p-4 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-medium text-slate-400">Image Contribution</span>
                                                <p className="text-[10px] text-slate-500 mt-0.5">How much the image influences the report</p>
                                            </div>
                                            <span className={`text-lg font-bold ${
                                                report.reportConfidence >= 3 ? 'text-emerald-400' :
                                                    report.reportConfidence >= 1 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {report.reportConfidence.toFixed(1)} nats
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })()}
                    </div>

                    {/* 右侧 */}
                    <div>
                        {/* AI报告 */}
                        <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden mb-3">
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
                                        className="w-full text-xs leading-relaxed text-slate-300 bg-transparent border border-white/[0.12] rounded-lg p-3 outline-none focus:border-blue-500/40 resize-none h-40"
                                    />
                                ) : (
                                    <div>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-2">Findings</p>
                                        <p className="text-xs leading-relaxed text-slate-300 mb-3">{report.reportContent}</p>
                                        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent my-3" />
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-2">Impression</p>
                                        <p className="text-xs leading-relaxed text-slate-300">{report.impression || 'No acute cardiopulmonary abnormality.'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Impression */}
                        {report.impression && (
                            <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl p-4 mb-3">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">AI Impression</p>
                                <p className="text-xs leading-relaxed text-slate-200">{report.impression}</p>
                            </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex gap-2">
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
                                    className="flex-1 text-xs py-2 rounded-lg border-none text-white font-medium cursor-pointer flex items-center justify-center gap-1"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                                >
                                    <Check size={13} /> Save
                                </button>
                            )}
                            {!editMode && (
                                <>
                                    <button
                                        onClick={handleSign}
                                        className="flex-1 text-xs py-2 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-emerald-400 flex items-center justify-center gap-1"
                                    >
                                        <Check size={13} className="text-emerald-400" /> Sign
                                    </button>
                                    <button
                                        onClick={() => report && report.id !== 'demo' && reportApi.exportPdf(report.id)}
                                        className="flex-1 text-xs py-2 rounded-lg border border-white/[0.12] bg-transparent text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-center gap-1"
                                    >
                                        <FileDown size={13} /> PDF
                                    </button>
                                    <button
                                        onClick={() => report && report.id !== 'demo' && reportApi.exportWord(report.id)}
                                        className="flex-1 text-xs py-2 rounded-lg border border-white/[0.12] bg-transparent text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-center gap-1"
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
