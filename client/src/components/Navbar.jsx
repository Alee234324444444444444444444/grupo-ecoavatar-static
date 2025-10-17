import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import logo from '../assets/logo.jpg';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navbarRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Efecto para cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Solo agregamos el listener si el menú está abierto
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="navbar-brand">
        <button 
          className="hamburger" 
          onClick={toggleMenu}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      <div className={`navbar-container ${isOpen ? 'open' : ''}`}>
        <ul className="navbar-links">
          <li>
            <Link to="/" className="logo">
              <img src={logo} alt="logo" />
            </Link>
          </li>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/publicaciones">Publicaciones</Link></li>
          {isAuthenticated && user?.isSuperuser && (
            <li><Link to="/admin/challenges">Admin Desafíos</Link></li>
          )}
          <li><Link to="/challenges">Desafíos</Link></li>
          {isAuthenticated && (
            <>
              <li><Link to="/reports">Rankings</Link></li>
              <li><Link to="/api/perfil">Perfil</Link></li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="welcome-message">¡Bienvenido aventurero {user?.username}!</span>
              <button onClick={handleLogout} className="login-btn">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;