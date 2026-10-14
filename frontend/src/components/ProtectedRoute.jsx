import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../api/axios';
import { getToken, saveUser } from '../api/session';

export default function ProtectedRoute({ admin = false, children }) {
  const [state, setState] = useState({ loading: true, user: null, error: false });
  useEffect(() => {
    let active = true;
    const portal = admin ? 'admin' : 'applicant';
    if (!getToken(portal)) {
      setState({ loading: false, user: null, error: false });
      return;
    }
    setState({ loading: true, user: null, error: false });
    API.get('/users/me', { portal }).then(({ data }) => {
      saveUser(portal, data);
      if (active) setState({ loading: false, user: data, error: false });
    }).catch(error => {
      if (active) setState({ loading: false, user: null, error: error.response?.status !== 401 });
    });
    return () => { active = false; };
  }, [admin]);
  if (state.loading) return <p role="status">Checking account access…</p>;
  if (state.error) return <p role="alert">Unable to reach the account service. Please reload after a moment.</p>;
  if (!state.user) return <Navigate to={admin ? '/admin-login' : '/'} replace />;
  if (admin && state.user.role !== 'admin') return <p role="alert">Administrator access required. <a href="/dashboard">Return to your account</a></p>;
  return children;
}
