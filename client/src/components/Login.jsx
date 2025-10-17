import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import api from '../config/api';              // 👈 instancia central de Axios
import '../styles/Login.css';
import Swal from 'sweetalert2';
import icon from '../assets/google-icon.png';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // 1) Sign-in en Firebase
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // 2) Intercambio con tu backend -> devuelve tu JWT + user
      //    Enviamos idToken y, opcionalmente, un perfil mínimo
      const payload = {
        idToken,
        profile: {
          email: result.user.email,
          name: result.user.displayName,
          username: result.user.email?.split('@')[0],
          googleId: result.user.uid,
        },
      };

      const { data } = await api.post('/api/auth/google', payload);

      // 3) Guardar sesión local
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user);

      navigate('/');
    } catch (error) {
      console.error('Error detallado Google:', error?.response?.data || error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error?.response?.data?.message ||
          'No se pudo iniciar sesión con Google',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple del username (sin puntos)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el nombre de usuario',
        text:
          'El nombre de usuario solo puede contener letras, números y guiones bajos (sin puntos).',
      });
      return;
    }

    try {
      setLoading(true);

      // 👉 En producción va contra tu App Service (baseURL viene del env)
      const { data } = await api.post('/api/auth/login', formData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user);

      navigate('/');
    } catch (error) {
      console.error('Error en login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error?.response?.data?.message ||
          'Usuario o contraseña incorrectos',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">
              <big>USUARIO:</big>
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <big>CONTRASEÑA:</big>
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loading}>
              <strong>{loading ? 'Ingresando…' : 'Ingresar'}</strong>
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              <strong>Cancelar</strong>
            </button>
          </div>
        </form>

        <div className="social-login">
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <img src={icon} alt="Google" />
            Iniciar sesión con Google
          </button>
        </div>

        <div className="register-link">
          <p>
            ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
