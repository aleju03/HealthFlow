import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Overview from './pages/Dashboard/Overview';
import Historical from './pages/Dashboard/Historical';
import ImportData from './pages/Dashboard/ImportData';
import Profile from './pages/Dashboard/Profile';

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const InitialRedirect = () => {
  const userId = localStorage.getItem('userId');
  return <Navigate to={userId ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
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
          >
            <Route index element={<Overview />} />
            <Route path="historical" element={<Historical />} />
            <Route path="import" element={<ImportData />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<InitialRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;