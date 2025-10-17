import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2'; // Importando SweetAlert2
import '../styles/Modal.css';

function Modal({ showModal, closeModal, challengeId }) {
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'error',
        title: 'Debes iniciar sesión',
        text: 'Para completar el desafío, por favor inicia sesión.',
      });
      return;
    }

    if (!photo || !description.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Debes completar todos los campos.',
      });
      return;
    }

    // Verificar longitud de la descripción
    if (description.length > 30) {
      Swal.fire({
        icon: 'warning',
        title: 'Descripción demasiado larga',
        text: 'La descripción no puede exceder los 30 caracteres.',
      });
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('description', description);
      formData.append('challenge_id', challengeId);
      formData.append('user_id', user.id);

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: '¡Desafío completado!',
          text: 'Tu publicación será revisada.',
        });
        setPhoto(null);
        setDescription('');
        closeModal();
      }
    } catch (error) {
      console.error('Error al enviar el post:', error);
      setError(error.response?.data?.message || 'Error al enviar la publicación');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Hubo un problema al enviar la publicación.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (event) => {
    const newDescription = event.target.value;

    // Si la longitud supera los 30 caracteres, mostrar notificación
    if (newDescription.length > 30 && description.length <= 30) {
      Swal.fire({
        icon: 'warning',
        title: 'Descripción demasiado larga',
        text: 'La descripción no puede exceder los 30 caracteres.',
      });
    }

    // Actualizar el estado de la descripción
    setDescription(newDescription);
  };

  if (!showModal) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 style={{ textAlign: 'center' }}>VAMOS A COMPLETAR EL DESAFÍO!</h2>
        <p>Sube una foto para demostrarlo.</p>

        {error && <p className="error-message" style={{ color: '#ff6b6b' }}>{error}</p>}
        
        <form className="form-modal" onSubmit={handleSubmit}>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            required
          />
          <textarea
            name="description"
            placeholder="Describe cómo completaste el desafío"
            rows="4"
            value={description}
            onChange={handleDescriptionChange}  // Usando el handleDescriptionChange
            maxLength="75" // Se mantiene el límite visual en 75
            required
          ></textarea>

          <div className="modal-buttons">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || !isAuthenticated}
            >
              {loading ? 'Enviando...' : 'Subir Publicación'}
            </button>
            <button 
              type="button" 
              className="btn-close" 
              onClick={closeModal}
              disabled={loading}
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
