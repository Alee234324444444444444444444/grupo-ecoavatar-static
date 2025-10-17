import React, { useState, useEffect, useCallback } from 'react';
import api from '@/config/api';        // 👈 usa la instancia centralizada
import { useAuth } from '../context/AuthContext';
import '../styles/Posts.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL; // para imágenes

export default function Posts() {
  const [userPosts, setUserPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Construye URL absoluta para fotos que vienen como "/uploads/..."
  const imgUrl = (path) =>
    path?.startsWith('http') ? path : `${API_BASE}${path || ''}`;

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get('/api/posts');

      if (isAuthenticated && user) {
        setUserPosts(data.filter((p) => p.user_id === user.id));
      }
      setAllPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleStatusChange = async (postId, newStatus) => {
    if (!user?.isSuperuser) return;
    try {
      await api.patch(`/api/posts/${postId}/status`, { status: newStatus });
      fetchPosts();
    } catch (err) {
      console.error('Error updating post status:', err);
    }
  };

  return (
    <div className="posts-container">
      {isAuthenticated && userPosts.length > 0 && (
        <section className="user-posts-section">
          <h2>Tus Publicaciones</h2>
          <div className="user-posts">
            {userPosts.map((post) => (
              <div key={post.id} className="user-post-card">
                <div className="post-image">
                  <img src={imgUrl(post.photo)} alt="Post" />
                </div>
                <div className="post-content">
                  <h3>{post.Challenge?.title || 'Desafío'}</h3>
                  <p>{post.description}</p>
                  <button
                    className={`status-button ${post.status}`}
                    onClick={() => handleStatusChange(post.id, 'approved')}
                  >
                    {post.status === 'pending'
                      ? 'En Revisión'
                      : post.status === 'approved'
                      ? 'Aprobado'
                      : 'Rechazado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="all-posts-section">
        <h2>TODAS LAS PUBLICACIONES</h2>
        <div className="posts-grid">
          {allPosts
            .filter((post) => post.status === 'approved')
            .map((post) => (
              <div key={post.id} className="post-grid-card">
                <div className="post-grid-title">
                  <h3>{post.Challenge?.title || 'Desafío'}</h3>
                </div>
                <div className="post-grid-image">
                  <img src={imgUrl(post.photo)} alt="Post" />
                </div>
                <div className="post-grid-description">
                  <p>{post.description}</p>
                  <span className="post-author">
                    OP: {post.User?.username}
                    <p>{new Date(post.created_at).toLocaleString()}</p>
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
