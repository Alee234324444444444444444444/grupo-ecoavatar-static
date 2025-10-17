import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de nombre de usuario (una mayúscula, las demás minúsculas y un número al final)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!usernameRegex.test(formData.username)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el nombre de usuario',
        text: 'El nombre de usuario solo puede contener letras, números y guiones bajos.'
      });
      return; // Detener la ejecución si la validación falla
    }
    

    // Validación del correo electrónico
    const email = formData.email;
    if (!email.includes('@')) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el correo electrónico',
        text: 'El correo electrónico debe contener el símbolo "@" y un dominio válido.'
      });
      return;
    }

    const emailRegex = /^[a-z0-9]+@[a-z0-9]+\.[a-z]{2,6}$/; // Correo con dominio simple
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo electrónico inválido',
        text: 'El correo electrónico no tiene un formato válido. Asegúrate de que esté en minúsculas y tenga un dominio adecuado, como "ejemplo@dominio.com".'
      });
      return;
    }

    // Validación de contraseñas coincidentes
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Las contraseñas que ingresaste no coinciden. Por favor, vuelve a escribirlas.'
      });
      return;
    }

    try {
      // Solo enviamos los campos que coinciden con el modelo
      const userData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      const response = await axios.post('/api/auth/register', userData);

      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Ya puedes iniciar sesión'
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (error) {
      console.error('Error en registro:', error);
      // Mensaje detallado si la respuesta del servidor es un error
      if (error.response) {
        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: error.response.data?.message || 'Hubo un problema al registrar el usuario. Esto podría deberse a problemas con el servidor o datos incorrectos enviados. Por favor, inténtalo de nuevo.'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: 'Hubo un problema al intentar conectar con el servidor. Esto podría ser debido a problemas de red o a un servicio caído. Verifica tu conexión a internet y vuelve a intentarlo.'
        });
      }
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
            />
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn">
              <strong>Registrarse</strong>
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/login')}
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