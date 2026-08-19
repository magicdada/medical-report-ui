import request from './request'
import type { ResultMessage, Token, Doctor, Patient, Report } from '../types'

// 认证相关
export const authApi = {
    login: (username: string, password: string) =>
        request.post<any, ResultMessage<Token>>('/auth/login', null, {
            params: { username, password }
        }),

    register: (username: string, password: string, realName: string, department: string) =>
        request.post<any, ResultMessage<Doctor>>('/auth/register', null, {
            params: { username, password, realName, department }
        }),

    refresh: (refreshToken: string) =>
        request.get<any, ResultMessage<Token>>(`/auth/refresh/${refreshToken}`),

    info: () =>
        request.get<any, ResultMessage<Doctor>>('/auth/info'),

    logout: () =>
        request.post<any, ResultMessage<object>>('/auth/logout'),

    updateInfo: (data: { realName: string; department: string; phone: string; email: string }) =>
        request.put<any, ResultMessage<Doctor>>('/auth/update', data),

    updatePassword: (oldPassword: string, newPassword: string) =>
        request.put<any, ResultMessage<object>>('/auth/password', null, {
            params: { oldPassword, newPassword }
        }),

}

// 患者相关
export const patientApi = {
    add: (patient: Partial<Patient>) =>
        request.post<any, ResultMessage<Patient>>('/patient/add', patient),

    getById: (id: string) =>
        request.get<any, ResultMessage<Patient>>(`/patient/get/${id}`),

    search: (name: string) =>
        request.get<any, ResultMessage<Patient[]>>('/patient/search', {
            params: { name }
        }),

    list: () =>
        request.get<any, ResultMessage<Patient[]>>('/patient/list'),
}

// 报告相关
export const reportApi = {
    generate: (patientId: string, files: File[]) => {
        const formData = new FormData()
        formData.append('patientId', patientId)
        files.forEach(file => formData.append('files', file))
        return request.post<any, ResultMessage<Report>>('/report/generate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
        })
    },

    getDetail: (id: string) =>
        request.get<any, ResultMessage<Report>>(`/report/getDetail/${id}`),

    getByPatient: (patientId: string) =>
        request.get<any, ResultMessage<Report[]>>(`/report/list/patient/${patientId}`),

    getMine: () =>
        request.get<any, ResultMessage<Report[]>>('/report/list/mine'),

    updateStatus: (id: string, status: string) =>
        request.put<any, ResultMessage<Report>>(`/report/status/${id}`, null, {
            params: { status }
        }),
    exportPdf: (reportId: string) => {
        window.open(`/api/export/pdf/${reportId}`, '_blank')
    },

    exportWord: (reportId: string) => {
        window.open(`/api/export/word/${reportId}`, '_blank')
    },
    updateContent: (id: string, reportContent: string) =>
        request.put<any, ResultMessage<Report>>(`/report/content/${id}`, null, {
            params: { reportContent },
        }),
}

// 统计相关
export const statsApi = {
    overview: () =>
        request.get<any, ResultMessage<any>>('/stats/overview'),

    monthly: () =>
        request.get<any, ResultMessage<any[]>>('/stats/monthly'),

    disease: () =>
        request.get<any, ResultMessage<any[]>>('/stats/disease'),

    comparison: () =>
        request.get<any, ResultMessage<any>>('/stats/comparison'),

    comparisonRecords: () =>
        request.get<any, ResultMessage<any[]>>('/stats/comparison/records'),

    efficiency: () =>
        request.get<any, ResultMessage<any>>('/stats/efficiency'),
}