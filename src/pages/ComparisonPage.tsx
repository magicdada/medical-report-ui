import { useEffect, useState } from 'react'
import { GitCompareArrows, Sparkles, User } from 'lucide-react'
import { statsApi } from '../api'

export default function ComparisonPage() {
    const [stats, setStats] = useState<any>(null)
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [statsRes, recordsRes] = await Promise.all([
                statsApi.comparison(),
                statsApi.comparisonRecords(),
            ])
            if (statsRes.success) setStats(statsRes.result)
            if (recordsRes.success) setRecords(recordsRes.result || [])
        } catch (err) {
            console.error('Failed to load comparison data', err)
        } finally {
            setLoading(false)
        }
    }

    // 简单diff：找出两段文本的差异行
    const getDiffLines = (original: string, modified: string) => {
        const origSentences = original.split('. ').filter(s => s.trim())
        const modSentences = modified.split('. ').filter(s => s.trim())

        const aiLines: { text: string; type: string }[] = []
        const doctorLines: { text: string; type: string }[] = []

        origSentences.forEach(s => {
            const sentence = s.endsWith('.') ? s : s + '.'
            if (modSentences.some(m => (m.endsWith('.') ? m : m + '.') === sentence)) {
                aiLines.push({ text: sentence, type: 'same' })
            } else {
                aiLines.push({ text: sentence, type: 'deleted' })
            }
        })

        modSentences.forEach(s => {
            const sentence = s.endsWith('.') ? s : s + '.'
            if (origSentences.some(o => (o.endsWith('.') ? o : o + '.') === sentence)) {
                doctorLines.push({ text: sentence, type: 'same' })
            } else {
                doctorLines.push({ text: sentence, type: 'added' })
            }
        })

        return { aiLines, doctorLines }
    }

    const currentRecord = records.length > 0 ? records[0] : null
    const diff = currentRecord ? getDiffLines(currentRecord.aiDraft, currentRecord.doctorFinal) : null

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-base font-medium text-slate-200 flex items-center gap-2">
                        <GitCompareArrows size={18} className="text-blue-400" />
                        AI vs Doctor Comparison
                    </p>
                    <p className="text-xs text-slate-400">Analyze differences between AI drafts and doctor-reviewed reports</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Total compared</div>
                    <p className="text-2xl font-medium text-blue-400">{stats?.total ?? 0}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Unmodified by doctor</div>
                    <p className="text-2xl font-medium text-emerald-400">{stats?.unmodifiedPercent ?? 0}%</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Minor edits</div>
                    <p className="text-2xl font-medium text-amber-400">{stats?.minorEditsPercent ?? 0}%</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.1] rounded-xl p-4">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Major changes</div>
                    <p className="text-2xl font-medium text-red-400">{stats?.majorChangesPercent ?? 0}%</p>
                </div>
            </div>

            {diff ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Sparkles size={12} className="text-violet-400" /> AI original draft
              </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-400 border border-violet-400/15">AI</span>
                        </div>
                        <div className="p-4">
                            {diff.aiLines.map((line, i) => (
                                <div
                                    key={i}
                                    className={`py-1.5 px-2.5 mb-1 rounded-r text-xs ${
                                        line.type === 'deleted'
                                            ? 'bg-red-400/[0.08] border-l-2 border-red-400'
                                            : 'pl-[12px]'
                                    }`}
                                >
                  <span className={line.type === 'deleted' ? 'text-red-300 line-through' : 'text-slate-400'}>
                    {line.text}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <User size={12} className="text-blue-400" /> Doctor reviewed
              </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/15">Final</span>
                        </div>
                        <div className="p-4">
                            {diff.doctorLines.map((line, i) => (
                                <div
                                    key={i}
                                    className={`py-1.5 px-2.5 mb-1 rounded-r text-xs ${
                                        line.type === 'added'
                                            ? 'bg-emerald-400/[0.08] border-l-2 border-emerald-400'
                                            : 'pl-[12px]'
                                    }`}
                                >
                  <span className={line.type === 'added' ? 'text-emerald-300' : 'text-slate-400'}>
                    {line.text}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl p-8 text-center mb-4">
                    <GitCompareArrows size={24} className="text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No comparison records yet</p>
                    <p className="text-[10px] text-slate-500 mt-1">Records will appear after doctors edit AI-generated reports</p>
                </div>
            )}

            {records.length > 1 && (
                <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/[0.08]">
                        <span className="text-xs font-medium text-slate-400">All comparison records</span>
                    </div>
                    {records.map((record, i) => (
                        <div key={record.id} className="flex items-center px-4 py-3 border-b border-white/[0.06] last:border-b-0 text-xs">
                            <span className="flex-1 text-slate-200">Patient: {record.patientId}</span>
                            <span className="w-20 text-slate-400">
                {new Date(record.createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}