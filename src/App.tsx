import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { AppRoutes } from './routes/AppRoutes';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-center" reverseOrder={false} />
                <div className="min-h-screen bg-brand-secondary text-gray-200 font-sans">
                    <AppRoutes />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
