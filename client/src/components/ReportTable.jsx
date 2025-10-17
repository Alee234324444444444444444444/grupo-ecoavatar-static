import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ReportTable.css';

const BASE = 'http://localhost:3000';

const Reports = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const labels = [
    "ID",
    "Nombre",
    "Username",
    "Email",
    "Comentarios",
    "Respuestas",
    "Últimos Comentarios"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE}/reports`);
        const formattedData = response.data.map(user => ({
          ...user,
          last_three_comments: Array.isArray(user.last_three_comments)
            ? user.last_three_comments.join('\n')
            : user.last_three_comments
        }));
        setUserData(formattedData);
      } catch (error) {
        console.error('Error al obtener los datos del ranking:', error);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="ranking-container">
        <h2>Ranking de Comentarios</h2>
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-container">
        <h2>Ranking de Comentarios</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className='ranking-container'>
      <h2>Ranking de Comentarios</h2>
      <div className="ranking-grid">
        {/* Columna de etiquetas */}
        <div className="labels-column">
          {labels.map((label, index) => (
            <div key={index} className="label-item">
              {label}
            </div>
          ))}
        </div>

        {/* Columna de datos de usuarios */}
        <div className="data-columns">
          {userData.length > 0 ? (
            userData.map((user, userIndex) => (
              <div key={user.id} className="user-data-column">
                <div className="user-header">OP</div>
                <div className="data-item">{user.id}</div>
                <div className="data-item">{user.name || 'N/A'}</div>
                <div className="data-item">{user.username || 'N/A'}</div>
                <div className="data-item">{user.email || 'N/A'}</div>
                <div className="data-item">{user.total_comments || '0'}</div>
                <div className="data-item">{user.total_responses || '0'}</div>
                <div className="data-item comments">
                  {user.last_three_comments || 'Sin comentarios recientes'}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No hay datos disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;