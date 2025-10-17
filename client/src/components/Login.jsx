import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import '../styles/Login.css';
import Swal from 'sweetalert2';
import icon from '../assets/google-icon.png';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        email: result.user.email,
        name: result.user.displayName,
        username: result.user.email.split('@')[0],
        googleId: result.user.uid
      };

      console.log('Datos a enviar al servidor:', userData); // Para debug

      const response = await axios.post('http://localhost:3000/api/auth/google', userData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      login(response.data.user);
      
      navigate('/');
    } catch (error) {
      console.error('Error detallado:', error.response?.data || error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al iniciar sesión con Google'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el username (no puede contener puntos)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el nombre de usuario',
        text: 'El nombre de usuario solo puede contener letras, números y guiones bajos, no puntos.'
      });
      return; // Detener la ejecución si el username es inválido
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      login(response.data.user);

      navigate('/');
    } catch (error) {
      console.error('Error en login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Usuario o contraseña incorrectos',
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username"><big>USUARIO:</big></label>
            <input
              type="text"
              name="username"
              id="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
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
          <div className="form-footer">
            <button type="submit" className="submit-btn">
              <strong>Ingresar</strong>
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/')}
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
          >
            <img src={icon} alt="Google" />
            Iniciar sesión con Google
          </button>
        </div>

        <div className="register-link">
          <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;


// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { auth } from '../config/firebase';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import '../styles/Login.css';
// import icon from '../assets/google-icon.png';

// function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [formData, setFormData] = useState({
//     username: '',
//     password: ''
//   });

//   const handleGoogleSignIn = async () => {
//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);
      
//       const userData = {
//         email: result.user.email,
//         name: result.user.displayName,
//         username: result.user.email.split('@')[0],
//         googleId: result.user.uid
//       };

//       const response = await axios.post('http://localhost:3000/api/auth/google', userData);

//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       login(response.data.user);
      
//       navigate('/');
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.response?.data?.message || 'Error al iniciar sesión con Google'
//       });
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const { username, password } = formData;

//     // Validar el username (sin puntos)
//     const usernameRegex = /^[a-zA-Z0-9_]+$/;
//     if (!usernameRegex.test(username)) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error en el usuario',
//         text: 'El usuario solo puede contener letras, números y guiones bajos, sin puntos.'
//       });
//       return;
//     }

//     // Validación de contraseña con Regex
//     const passwordRegex = /^[A-Z][a-z0-9\W_]{1,14}$/;
//     const hasNumber = /\d/;
//     const hasSpecialChar = /[\W_]/; 

//     if (password.length > 15) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Contraseña demasiado larga',
//         text: 'La contraseña no debe exceder los 15 caracteres.'
//       });
//       return;
//     }

//     if (!passwordRegex.test(password)) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Formato de contraseña inválido',
//         text: 'La contraseña debe empezar con mayúscula, contener minúsculas, al menos un número y un carácter especial.'
//       });
//       return;
//     }

//     if (!hasNumber.test(password)) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Falta un número',
//         text: 'La contraseña debe incluir al menos un número.'
//       });
//       return;
//     }

//     if (!hasSpecialChar.test(password)) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Falta un carácter especial',
//         text: 'La contraseña debe incluir al menos un carácter especial como !, @, #, etc.'
//       });
//       return;
//     }

//     try {
//       const response = await axios.post('http://localhost:3000/api/auth/login', formData);
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       login(response.data.user);

//       navigate('/');
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.response?.data?.message || 'Usuario o contraseña incorrectos',
//       });
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2>Iniciar Sesión</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="input-group">
//             <label htmlFor="username"><big>Usuario:</big></label>
//             <input
//               type="text"
//               name="username"
//               id="username"
//               required
//               value={formData.username}
//               onChange={handleChange}
//               placeholder="Ingresa tu usuario"
//             />
//           </div>
//           <div className="input-group">
//             <label htmlFor="password"><big>Contraseña:</big></label>
//             <input
//               type="password"
//               name="password"
//               id="password"
//               required
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Ingresa tu contraseña"
//             />
//           </div>
//           <div className="form-footer">
//             <button type="submit" className="submit-btn">
//               <strong>Ingresar</strong>
//             </button>
//             <button 
//               type="button" 
//               className="cancel-btn"
//               onClick={() => navigate('/')}
//             >
//               <strong>Cancelar</strong>
//             </button>
//           </div>
//         </form>

//         <div className="social-login">
//           <button 
//             type="button" 
//             className="google-btn"
//             onClick={handleGoogleSignIn}
//           >
//             <img src={icon} alt="Google" />
//             Iniciar sesión con Google
//           </button>
//         </div>

//         <div className="register-link">
//           <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;