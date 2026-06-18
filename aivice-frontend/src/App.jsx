import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/layout/AppShell";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Clients from "./pages/clients/Clients";
import Invoices from "./pages/invoices/Invoices";
import InvoiceForm from "./pages/invoices/InvoiceForm";
import InvoiceDetail from "./pages/invoices/InvoiceDetail";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/clients"
                    element={
                        <ProtectedRoute>
                            <Clients />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/invoices"
                    element={
                        <ProtectedRoute>
                            <Invoices />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/invoices/new"
                    element={
                        <ProtectedRoute>
                            <InvoiceForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/invoices/:id/edit"
                    element={
                        <ProtectedRoute>
                            <InvoiceForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/invoices/:id"
                    element={
                        <ProtectedRoute>
                            <InvoiceDetail />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
