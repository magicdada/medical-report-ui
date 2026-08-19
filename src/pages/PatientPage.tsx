import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, History, X } from 'lucide-react'
import { patientApi } from '../api'
import type { Patient } from '../types'

export default function PatientPage() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<Patient[]>([])
    const [searchName, setSearchName] = useState('')
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [newPatient, setNewPatient] = useState({
        patientNo: '',
        name: '',
        gender: 'Male',
        age: '',
        medicalHistory: '',
    })

    useEffect(() => {
        loadPatients()
    }, [])

    const loadPatients = async () => {
        try {
            const res = await patientApi.list()
            if (res.success) setPatients(res.result || [])
        } catch (err) {
            console.error('Failed to load patients', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchName.trim()) {
            loadPatients()
            return
        }
        try {
            const res = await patientApi.search(searchName)
            if (res.success) setPatients(res.result || [])
        } catch (err) {
            console.error('Search failed', err)
        }
    }

    const handleAdd = async () => {
        if (!newPatient.patientNo || !newPatient.name) {
            alert('Patient No. and Name are required')
            return
        }
        try {
            const res = await patientApi.add({
                ...newPatient,
                age: newPatient.age ? Number(newPatient.age) : undefined,
            })
            if (res.success) {
                setShowAdd(false)
                setNewPatient({ patientNo: '', name: '', gender: 'Male', age: '', medicalHistory: '' })
                loadPatients()
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Add failed')
        }
    }

    return (
        <div>
            {/* 搜索栏 */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patient name or ID..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full text-xs py-2.5 pl-9 pr-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="text-xs py-2 px-4 rounded-lg border border-white/[0.08] bg-transparent text-slate-400 cursor-pointer hover:text-slate-200"
                >
                    Search
                </button>
                <button
                    onClick={() => setShowAdd(true)}
                    className="text-xs py-2 px-4 rounded-lg border-none text-white font-medium cursor-pointer flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                >
                    <Plus size={14} /> Add patient
                </button>
            </div>

            {/* 患者列表 */}
            <div className="bg-white/[0.055] border border-white/[0.1] rounded-xl overflow-hidden">
                <div className="flex items-center px-4 py-3 text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                    <span className="w-16">No.</span>
                    <span className="flex-1">Name</span>
                    <span className="w-16">Gender</span>
                    <span className="w-12">Age</span>
                    <span className="w-20">Created</span>
                    <span className="w-16">Action</span>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading...</div>
                ) : patients.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No patients found</div>
                ) : (
                    patients.map((patient) => (
                        <div
                            key={patient.id}
                            className="flex items-center px-4 py-3 border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.015] text-xs"
                        >
                            <span className="w-16 text-slate-400">{patient.patientNo}</span>
                            <span className="flex-1 text-slate-200">{patient.name}</span>
                            <span className="w-16 text-slate-400">{patient.gender}</span>
                            <span className="w-12 text-slate-400">{patient.age}</span>
                            <span className="w-20 text-slate-400">
                {patient.createTime ? new Date(patient.createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
              </span>
                            <span className="w-16">
                <button
                    onClick={() => navigate(`/reports?patientId=${patient.id}`)}
                    className="text-[10px] text-blue-400 cursor-pointer bg-transparent border-none flex items-center gap-1 hover:text-blue-300"
                >
                  <History size={12} /> History
                </button>
              </span>
                        </div>
                    ))
                )}
            </div>

            {/* 新增患者弹窗 */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#161d2e] border border-white/[0.08] rounded-xl w-96 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-200">Add new patient</span>
                            <button
                                onClick={() => setShowAdd(false)}
                                className="text-slate-400 hover:text-slate-300 bg-transparent border-none cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Patient No. *"
                                value={newPatient.patientNo}
                                onChange={(e) => setNewPatient({ ...newPatient, patientNo: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40"
                            />
                            <input
                                type="text"
                                placeholder="Name *"
                                value={newPatient.name}
                                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40"
                            />
                            <select
                                value={newPatient.gender}
                                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Age"
                                value={newPatient.age}
                                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40"
                            />
                            <textarea
                                placeholder="Medical history (optional)"
                                value={newPatient.medicalHistory}
                                onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                                className="w-full text-xs py-2 px-3 rounded-lg border border-white/[0.12] bg-white/[0.06] text-slate-200 outline-none focus:border-blue-500/40 h-20 resize-none"
                            />
                            <button
                                onClick={handleAdd}
                                className="w-full text-xs py-2.5 rounded-lg border-none text-white font-medium cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                            >
                                Add patient
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}