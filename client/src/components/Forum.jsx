import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Reply, Edit, Trash2, Send, X, ChevronDown, ChevronRight } from 'lucide-react';
import ReplyComponent from './ReplyComponent';
import '../styles/Forum.css';

const BASE_URL = 'http://localhost:3000';

function Forum() {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/comments`);
      if (response.status === 200) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  };

  const toggleExpanded = (id, type = 'comment') => {
    const setFunction = type === 'comment' ? setExpandedComments : setExpandedReplies;
    setFunction(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    if (newComment.length > 50) {
      Swal.fire('Error', 'El comentario no puede superar los 50 caracteres', 'error');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/comments`, {
        username: user.username,
        content: newComment,
      });
      if (response.status === 201) {
        setComments([response.data, ...comments]);
        setNewComment('');
        Swal.fire('Éxito', 'Comentario publicado con éxito', 'success');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo publicar el comentario', 'error');
    }
  };

  const handleReply = async (parentId, content) => {
    if (!content.trim() || !isAuthenticated) return;

    try {
      const response = await axios.post(`${BASE_URL}/comments`, {
        username: user.username,
        content: content,
        parent_id: parentId,
      });

      if (response.status === 201) {
        const newReply = response.data;

        // Actualizar el estado local
        setComments(prevComments => {
          const updateReplies = (comments) => {
            return comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newReply]
                };
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateReplies(comment.replies)
                };
              }
              return comment;
            });
          };

          return updateReplies(prevComments);
        });

        // Mostrar mensaje de éxito
        Swal.fire('Éxito', 'Respuesta publicada con éxito', 'success');
      }
    } catch (error) {
      console.error('Error al responder:', error);
      Swal.fire('Error', 'No se pudo publicar la respuesta', 'error');
    }
  };

  const handleEdit = async (commentId, content) => {
    if (content.length > 50) {
      Swal.fire('Error', 'El comentario no puede superar los 50 caracteres', 'error');
      return;  // No proceder si la longitud excede los 50 caracteres
    }

    try {
      const response = await axios.put(`${BASE_URL}/comments/${commentId}`, {
        user_id: user.id,
        content
      });

      if (response.status === 200) {
        await fetchComments(); // Recargar comentarios
        Swal.fire('Éxito', 'Comentario modificado con éxito', 'success');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo modificar el comentario', 'error');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/comments/${commentId}`, {
        data: { user_id: user.id }
      });

      if (response.status === 200) {
        await fetchComments(); // Recargar comentarios
        Swal.fire('Éxito', 'Comentario eliminado con éxito', 'success');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo eliminar el comentario', 'error');
    }
  };

  return (
    <section className="foro">
      <h3>FORO DE DISCUSIÓN</h3>
      {isAuthenticated && (
        <div className="nuevo-comentario">
          <textarea
            className="foro-textarea"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="btn-publicar" onClick={handlePostComment}>
            Publicar
          </button>
        </div>
      )}
      <ul className="comentarios">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.id} className="comentario-item">
              <div className="comentario-box">
                <div className="comentario-header">
                  <strong>OP: {comment.User?.username}</strong>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {isAuthenticated && (
                    <div className="comment-actions">
                      <button 
                        className="icon-button"
                        title="Responder"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply size={18} />
                      </button>
                      {user && comment.User && user.username === comment.User.username && (
                        <>
                          <button 
                            className="icon-button"
                            title="Modificar"
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditingContent(comment.content);
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="icon-button delete"
                            title="Eliminar"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {replyingTo === comment.id && (
                  <div className="reply-box">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                    />
                    <div className="reply-actions">
                      <button 
                        className="icon-button"
                        title="Enviar Respuesta"
                        onClick={() => {
                          handleReply(comment.id, replyContent);
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        <Send size={18} />
                      </button>
                      <button 
                        className="icon-button"
                        title="Cancelar"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
                                 
                {editingComment === comment.id ? (
                  <div className="edit-container">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="edit-textarea"
                    />
                    <div className="edit-actions">
                      <button 
                        className="icon-button"
                        onClick={() => handleEdit(comment.id, editingContent)}
                      >
                        <Send size={18} />
                      </button>
                      <button 
                        className="icon-button"
                        onClick={() => {
                          setEditingComment(null);
                          setEditingContent('');
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-content">{comment.content}</p>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <>
                    <button 
                      className="expand-button"
                      onClick={() => toggleExpanded(comment.id)}
                    >
                      {expandedComments.has(comment.id) ? 
                        <ChevronDown size={18} /> : 
                        <ChevronRight size={18} />
                      }
                      {comment.replies.length} respuestas
                    </button>
                    {expandedComments.has(comment.id) && (
                      <div className="replies-container">
                        {comment.replies.map(reply => (
                          <ReplyComponent
                            key={reply.id}
                            reply={reply}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            expandedReplies={expandedReplies}
                            toggleExpanded={toggleExpanded}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          ))
        ) : (
          <p>No hay comentarios aún.</p>
        )}
      </ul>
    </section>
  );
}

export default Forum;
