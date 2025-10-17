import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../config/firebase';          // ← instancia con baseURL desde REACT_APP_API_BASE_URL
import '../styles/Register.css';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Normalizaciones útiles
    if (name === 'email') {
      setFormData((s) => ({ ...s, [name]: value.trim().toLowerCase() }));
    } else if (name === 'username') {
      // Solo letras/números/guion_bajo; sin espacios
      const clean = value.replace(/[^\w]/g, '');
      setFormData((s) => ({ ...s, [name]: clean }));
    } else {
      setFormData((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación username (letras, números, _ )
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el nombre de usuario',
        text: 'El nombre de usuario solo puede contener letras, números y guiones bajos.'
      });
      return;
    }

    // Validación email simple (en minúsculas)
    const email = formData.email;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo electrónico inválido',
        text: 'Verifica el formato del correo. Ej: usuario@dominio.com'
      });
      return;
    }

    // Validación contraseñas coinciden
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Vuelve a escribir la contraseña.'
      });
      return;
    }

    try {
      setLoading(true);

      // Solo lo que espera tu backend
      const payload = {
        name: formData.name.trim(),
        username: formData.username,
        email: email,
        password: formData.password
      };

      const { data } = await api.post('/api/auth/register', payload);

      if (data) {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Ya puedes iniciar sesión'
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text:
          error?.response?.data?.message ||
          'Hubo un problema al registrar el usuario. Inténtalo nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name"><big>NOMBRE COMPLETO:</big></label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingresa tu nombre completo"
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="username"><big>NOMBRE DE USUARIO:</big></label>
            <input
              type="text"
              name="username"
              id="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Elige un nombre de usuario"
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email"><big>CORREO ELECTRÓNICO:</big></label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password"><big>CONTRASEÑA:</big></label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword"><big>CONFIRMAR CONTRASEÑA:</big></label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              autoComplete="new-password"
            />
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loading}>
              <strong>{loading ? 'Registrando…' : 'Registrarse'}</strong>
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              <strong>Cancelar</strong>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
