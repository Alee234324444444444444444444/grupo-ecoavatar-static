import React, { useState } from 'react';
import { Reply, Edit, Trash2, Send, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReplyComponent = ({ 
  reply, 
  level = 1, 
  onReply, 
  onEdit, 
  onDelete,
  expandedReplies,
  toggleExpanded 
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    onReply(reply.id, replyContent);
    setIsReplying(false);
    setReplyContent('');
  };

  const handleEdit = () => {
    onEdit(reply.id, editContent);
    setIsEditing(false);
  };

  return (
    <div className={`reply-container level-${level}`}>
      <div className="reply-header">
        <strong>OP: {reply.User?.username}</strong>
        <span className="reply-date">
          {new Date(reply.created_at).toLocaleString()}
        </span>
        <div className="reply-actions">
          <button 
            className="icon-button"
            title="Responder"
            onClick={() => setIsReplying(true)}
          >
            <Reply size={16} />
          </button>
          
          {user && reply.User && user.username === reply.User.username && (
            <>
              <button 
                className="icon-button"
                title="Modificar"
                onClick={() => {
                  setIsEditing(true);
                  setEditContent(reply.content);
                }}
              >
                <Edit size={16} />
              </button>
              <button 
                className="icon-button delete"
                title="Eliminar"
                onClick={() => onDelete(reply.id)}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="edit-container">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button className="icon-button" onClick={handleEdit}>
              <Send size={16} />
            </button>
            <button 
              className="icon-button"
              onClick={() => {
                setIsEditing(false);
                setEditContent(reply.content);
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <p className="reply-content">{reply.content}</p>
      )}

      {isReplying && (
        <div className="reply-box">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escribe tu respuesta..."
          />
          <div className="reply-actions">
            <button 
              className="icon-button" 
              onClick={handleReply}
            >
              <Send size={16} />
            </button>
            <button 
              className="icon-button"
              onClick={() => {
                setIsReplying(false);
                setReplyContent('');
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

        {reply.replies?.length > 0 && (
        <div className="replies-container">
            <button 
            className="expand-button"
            onClick={() => toggleExpanded(reply.id, 'reply')}
            >
            {expandedReplies.has(reply.id) ? (
                <>
                <ChevronDown size={16} />
                Ocultar respuestas ({reply.replies.length})
                </>
            ) : (
                <>
                <ChevronRight size={16} />
                Mostrar respuestas ({reply.replies.length})
                </>
            )}
            </button>
            {expandedReplies.has(reply.id) && (
            <div className="nested-replies">
                {reply.replies.map(nestedReply => (
                <ReplyComponent 
                    key={nestedReply.id}
                    reply={nestedReply}
                    level={level + 1}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    expandedReplies={expandedReplies}
                    toggleExpanded={toggleExpanded}
                />
                ))}
            </div>
            )}
        </div>
        )}
    </div>
  );
};

export default ReplyComponent;