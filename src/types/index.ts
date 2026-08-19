// 医生
export interface Doctor {
    id: string
    username: string
    realName: string
    department: string
    phone: string
    email: string
    enabled: boolean
    createTime: string
}

// 患者
export interface Patient {
    id: string
    patientNo: string
    name: string
    gender: string
    age: number
    medicalHistory: string
    createTime: string
}

// 诊断报告
export interface Report {
    id: string
    doctorId: string
    patientId: string
    patientNo?: string
    patientName?: string
    imagePath: string
    reportContent: string
    aiDraft?: string
    impression?: string
    gate?: string
    reportConfidence?: number
    findingsKeywords?: string
    heatmapPath?: string
    pdfPath?: string
    status: string
    createTime: string
    updateTime?: string
}

// Token
export interface Token {
    accessToken: string
    refreshToken: string
}

// 统一返回结果
export interface ResultMessage<T> {
    success: boolean
    message: string
    code: number
    timestamp: number
    result: T
}

// AI置信度
export interface ConfidenceItem {
    finding: string
    score: number
}

// AI对比分析
export interface ComparisonRecord {
    id: string
    patientName: string
    aiDraft: string
    doctorFinal: string
    changeType: string
    createTime: string
}