import type { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CommentPage from './pages/CommentPage'; // Main page
import NotificationList from './components/NotificationList'; // Notifications component

// Utility function to check if user is logged in
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Protected route component
const PrivateRoute = ({ element }: { element: ReactElement }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

// Public route (for login/register) that redirects to home if already logged in
const PublicRoute = ({ element }: { element: ReactElement }) => {
  return isAuthenticated() ? <Navigate to="/" /> : element;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute element={<CommentPage />} />} />
        <Route path="/notifications" element={<PrivateRoute element={<NotificationList />} />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/register" element={<PublicRoute element={<Register />} />} />
      </Routes>
    </Router>
  );
}

