import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminChallenges.css';
import { PREDEFINED_REWARDS } from '../rewards';
import Swal from 'sweetalert2';

const AdminChallenges = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('challenges');
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily',
    due_date: '',
    rewardName: '',
    rewardImage: null
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.isSuperuser) {
      navigate('/');
    }
    fetchChallenges();
    fetchPosts();
  }, [isAuthenticated, user]);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/challenges', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChallenges(response.data);
    } catch (error) {
      console.error('Error al obtener desafíos', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los desafíos',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error al obtener posts', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las publicaciones',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedReward = Object.values(PREDEFINED_REWARDS)
        .find(reward => reward.id === formData.rewardType);
  
      const challengeData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        due_date: formData.due_date
      };
  
      if (selectedReward) {
        challengeData.rewardName = selectedReward.name;
        challengeData.rewardType = selectedReward.id;
        challengeData.rewardConfig = JSON.stringify(
          selectedReward.type === 'static' ? selectedReward.renderConfig : selectedReward.spriteConfig
        );
      }
  
      const response = await axios.post(
        'http://localhost:3000/api/challenges/add', 
        challengeData,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Desafío creado correctamente',
        confirmButtonColor: '#3085d6'
      });
  
      fetchChallenges();
      setFormData({
        title: '',
        description: '',
        type: 'daily',
        due_date: '',
        rewardType: ''
      });
  
    } catch (error) {
      console.error('Error al crear desafío', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el desafío',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleEdit = async (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    setEditingChallenge(challenge);
    setFormData({
      ...formData,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      due_date: challenge.due_date
    });
  };

  const handleDelete = async (challengeId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/challenges/${challengeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        await Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El desafío ha sido eliminado.',
          confirmButtonColor: '#3085d6'
        });
        
        fetchChallenges();
      } catch (error) {
        console.error('Error al eliminar desafío', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el desafío',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/challenges/${editingChallenge.id}`,
        {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          due_date: formData.due_date
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      await Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'El desafío ha sido actualizado correctamente',
        confirmButtonColor: '#3085d6'
      });
      
      setEditingChallenge(null);
      fetchChallenges();
      setFormData({
        title: '',
        description: '',
        type: 'daily',
        due_date: '',
        rewardName: '',
        rewardImage: null
      });
    } catch (error) {
      console.error('Error al actualizar desafío', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el desafío',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handlePostStatus = async (postId, newStatus) => {
    const actionText = newStatus === 'approved' ? 'aprobar' : 'rechazar';
    
    const result = await Swal.fire({
      title: `¿Estás seguro de ${actionText} esta publicación?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(
          `http://localhost:3000/api/posts/${postId}/status`,
          { 
            status: newStatus,
            approved_by: user.id
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `La publicación ha sido ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} correctamente`,
          confirmButtonColor: '#3085d6'
        });

        fetchPosts();
      } catch (error) {
        console.error('Error al actualizar estado del post', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado de la publicación',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Gestionar Desafíos
        </button>
        <button 
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Revisar Publicaciones
        </button>
      </div>

      {activeTab === 'challenges' ? (
        <div className="challenges-section">
          <h2>Crear Nuevo Desafío</h2>
          <form onSubmit={editingChallenge ? handleUpdate : handleSubmit} className="challenge-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Título"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
            {!editingChallenge && (
              <div className="form-group">
                <label>Seleccionar Recompensa</label>
                <select
                  value={formData.rewardType}
                  onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                  required
                >
                  <option value="">Seleccionar Recompensa</option>
                  {Object.entries(PREDEFINED_REWARDS).map(([key, reward]) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="submit-button">
              {editingChallenge ? 'Actualizar Desafío' : 'Añadir Desafío'}
            </button>
          </form>

          <h3 className="adm-ch-h3">Lista de Desafíos</h3>
          <div className="challenges-list">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="challenge-item">
                <h4>{challenge.title}</h4>
                <p>{challenge.description}</p>
                <span className="challenge-type">{challenge.type}</span>
                <div className="challenge-actions">
                  <button onClick={() => handleEdit(challenge.id)}>Editar</button>
                  <button onClick={() => handleDelete(challenge.id)}>Eliminar</button>
                </div>
                {challenge.Reward && (
                  <div className="reward-info">
                    <p>Recompensa: {challenge.Reward.name}</p>
                    <img 
                      src={`http://localhost:3000${challenge.Reward.image}`} 
                      alt="Recompensa" 
                      className="reward-preview"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="posts-section">
          <h2>Revisar Publicaciones</h2>
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post.id} className="post-review-card">
                <div className="post-image">
                  <img src={`http://localhost:3000${post.photo}`} alt="Post" />
                </div>
                <div className="post-details">
                  <h4>Desafío: {post.Challenge?.title}</h4>
                  <p>Usuario: {post.User?.username}</p>
                  <p>Descripción: {post.description}</p>
                  <p>Estado actual: {post.status}</p>
                  {post.status === 'pending' && (
                    <div className="post-actions">
                      <button
                        className="approve-button"
                        onClick={() => handlePostStatus(post.id, 'approved')}
                      >
                        Aprobar
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handlePostStatus(post.id, 'rejected')}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChallenges;