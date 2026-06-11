import useAuth from '../../hooks/useAuth';
import Dashboard from './Dashboard';
import DoctorDashboard from '../doctor/DoctorDashboard';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import AdminDashboard from '../admin/AdminDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return <div style={loadingStyle}>Se încarcă...</div>;
  }

  
  const token = typeof user === 'string' ? user : (user.token || user.accessToken || user.jwt);
  
  let decodedToken = null;
  try {
    if (token) {
      decodedToken = jwtDecode(token);
    }
  } catch (error) {
    console.error("Token invalid sau corupt:", error);
  }


  const hasRole = (roleName) => {
    if (!decodedToken) return false;

    const rolesSource = decodedToken.roles || decodedToken.role || decodedToken.authorities || decodedToken.scope || [];
    const targetRole = roleName.toUpperCase();

    if (Array.isArray(rolesSource)) {
      return rolesSource.some(auth => {
        const val = typeof auth === 'object' ? (auth.authority || auth.role) : auth;
        return val?.toUpperCase().includes(targetRole);
      });
    }

    if (typeof rolesSource === 'string') {
      return rolesSource.toUpperCase().includes(targetRole);
    }

    return false;
  };

  if (hasRole('DOCTOR')) {
    return <DoctorDashboard />;
  }

  if (hasRole('PATIENT')) {
    return <Dashboard />;
  }

  if(hasRole('ADMIN')) {
    return <AdminDashboard />;
  }

  return (
    <div style={errorContainerStyle}>
      <div>
        <p style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Rolul nu există în Token
        </p>
        <div style={{ textAlign: 'left', backgroundColor: '#113d23', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
          <strong>Câmpuri găsite în JWT-ul tău:</strong>
          <pre style={{ margin: '0.5rem 0 0 0', overflowX: 'auto' }}>
            {JSON.stringify(decodedToken, null, 2)}
          </pre>
        </div>
        <button onClick={() => navigate('/login')} style={buttonStyle}>
          Înapoi la Login
        </button>
      </div>
    </div>
  );
}

const loadingStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0a2818', color: '#ffffff', fontFamily: "'DM Sans', sans-serif" };
const errorContainerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0a2818', color: '#ffffff', fontFamily: "'DM Sans', sans-serif", padding: '2rem' };
const buttonStyle = { padding: '0.75rem 1.5rem', backgroundColor: '#2ecc71', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' };