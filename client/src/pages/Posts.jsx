import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Posts.css';

function Posts() {
  const [userPosts, setUserPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (isAuthenticated && user) {
        const userPosts = response.data.filter(post => post.user_id === user.id);
        setUserPosts(userPosts);
      }
      setAllPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    if (!user?.isSuperuser) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/posts/${postId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  return (
    <div className="posts-container">
      {isAuthenticated && userPosts.length > 0 && (
        <section className="user-posts-section">
          <h2>Tus Publicaciones</h2>
          <div className="user-posts">
            {userPosts.map(post => (
              <div key={post.id} className="user-post-card">
                <div className="post-image">
                  <img src={`http://localhost:3000${post.photo}`} alt="Post" />
                </div>
                <div className="post-content">
                  <h3>{post.Challenge?.title || 'Desafío'}</h3>
                  <p>{post.description}</p>
                  <button 
                    className={`status-button ${post.status}`}
                    onClick={() => handleStatusChange(post.id, 'approved')}
                  >
                    {post.status === 'pending' ? 'En Revisión' : 
                     post.status === 'approved' ? 'Aprobado' : 'Rechazado'}
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
            .filter(post => post.status === 'approved')
            .map(post => (
            <div key={post.id} className="post-grid-card">
              <div className="post-grid-title">
                <h3>{post.Challenge?.title || 'Desafío'}</h3>
              </div>
              <div className="post-grid-image">
                <img src={`http://localhost:3000${post.photo}`} alt="Post" />
              </div>
              <div className="post-grid-description">
                <p>{post.description}</p>
                <span className="post-author">OP: {post.User?.username}
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

export default Posts;