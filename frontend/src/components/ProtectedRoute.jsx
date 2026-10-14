import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../api/axios';

export default function ProtectedRoute({ admin = false, children }) {
  const [state, setState] = useState({ loading: true, user: null, error: false });
  useEffect(() => {
    let active = true;
    if (!localStorage.getItem('token')) {
      setState({ loading: false, user: null, error: false });
      return;
    }
    API.get('/users/me').then(({ data }) => {
      localStorage.setItem('user', JSON.stringify(data));
      if (active) setState({ loading: false, user: data, error: false });
    }).catch(error => {
      if (active) setState({ loading: false, user: null, error: error.response?.status !== 401 });
    });
    return () => { active = false; };
  }, []);
  if (state.loading) return <p role="status">Checking account access…</p>;
  if (state.error) return <p role="alert">Unable to reach the account service. Please reload after a moment.</p>;
  if (!state.user) return <Navigate to={admin ? '/admin-login' : '/'} replace />;
  if (admin && state.user.role !== 'admin') return <p role="alert">Administrator access required. <a href="/dashboard">Return to your account</a></p>;
  return children;
}
