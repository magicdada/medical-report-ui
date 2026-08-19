import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import DiagnosisPage from '../pages/DiagnosisPage'
import PatientPage from '../pages/PatientPage'
import ReportPage from '../pages/ReportPage'
import ComparisonPage from '../pages/ComparisonPage'
import SettingsPage from '../pages/SettingsPage'

// 路由守卫：未登录跳转到登录页
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('accessToken')
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return <>{children}</>
}

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <DashboardPage /> },
            { path: 'diagnosis', element: <DiagnosisPage /> },
            { path: 'patients', element: <PatientPage /> },
            { path: 'reports', element: <ReportPage /> },
            { path: 'comparison', element: <ComparisonPage /> },
            { path: 'settings', element: <SettingsPage /> },
        ],
    },
])

export default router