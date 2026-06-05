import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // Three states: true = verifying with server, false = done
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      // No token at all — go straight to login
      setLoading(false);
      return;
    }

    // Token exists in storage — validate it with the server
    api.get('/admin/me')
      .then(({ data }) => {
        setAdmin({ name: data.name, email: data.email });
      })
      .catch(() => {
        // Token invalid or expired — wipe it so the login page shows
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setAdmin(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Step 1: verify credentials → triggers OTP email → returns { otpSent, maskedEmail }
  const login = async (email, password) => {
    const { data } = await api.post('/admin/login', { email, password });
    return data;
  };

  // Step 2: verify OTP → issues JWT → sets admin state
  const verifyOtp = async (email, otp) => {
    const { data } = await api.post('/admin/verify-otp', { email, otp });
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminData', JSON.stringify({ name: data.name, email: data.email }));
    setAdmin({ name: data.name, email: data.email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
