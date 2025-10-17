import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/perfil.css';

function Perfil() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  const profileLabels = [
    { label: "Nombre completo", key: "full_name" },
    { label: "Usuario", key: "username" },
    { label: "Email", key: "email" },
    { label: "Personaje", key: "character_name" }
  ];

  const statsLabels = [
    { label: "Total de publicaciones", key: "total_posts" },
    { label: "Total de comentarios", key: "total_comments" },
    { label: "Total de retos", key: "total_challenges" },
    { label: "Recompensas equipadas", key: "rewards_earned" }
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [user, isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token disponible. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3000/api/perfil', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="perfil-container"><div className="loading">Cargando perfil...</div></div>;
  if (error) return <div className="perfil-container"><div className="error">{error}</div></div>;
  if (!userProfile) return <div className="perfil-container"><div className="error">No se encontró el usuario.</div></div>;

  return (
    <div className="perfil-container">
      <h2>Perfil de Usuario</h2>
      
      <div className="profile-grid">
        {/* Información Personal */}
        <div className="info-section">
          <h3>Información Personal</h3>
          <div className="data-grid">
            <div className="labels-column">
              {profileLabels.map(item => (
                <div key={item.key} className="label-item">{item.label}</div>
              ))}
            </div>
            <div className="values-column">
              <div className="data-item">{userProfile.full_name || 'N/A'}</div>
              <div className="data-item">{userProfile.username || 'N/A'}</div>
              <div className="data-item">{userProfile.email || 'N/A'}</div>
              <div className="data-item">{userProfile.character_name || 'No asignado'}</div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="info-section">
          <h3>Estadísticas</h3>
          <div className="data-grid">
            <div className="labels-column">
              {statsLabels.map(item => (
                <div key={item.key} className="label-item">{item.label}</div>
              ))}
            </div>
            <div className="values-column">
              <div className="data-item">{userProfile.total_posts || '0'}</div>
              <div className="data-item">{userProfile.total_comments || '0'}</div>
              <div className="data-item">{userProfile.total_challenges || '0'}</div>
              <div className="data-item">{userProfile.rewards_earned || 'Ninguna'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;