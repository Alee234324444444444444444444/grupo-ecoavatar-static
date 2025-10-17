import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import '../styles/ChallengesSection.css';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/challenges');
      setChallenges(response.data);
    } catch (error) {
      console.error('Error al obtener desafíos:', error);
    }
  };

  const openModal = (challengeId) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para completar desafíos');
      return;
    }
    setSelectedChallengeId(challengeId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChallengeId(null);
  };

  return (
    <div className="challenges-container">
      <h2>DESAFÍOS</h2>
      <ul>
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            <li key={challenge.id}>
              {challenge.title} - {challenge.description}
              <button 
                className="challenges-container-btn" 
                onClick={() => openModal(challenge.id)}
                disabled={!isAuthenticated}
              >
                Completar
              </button>
            </li>
          ))
        ) : (
          <p>No hay desafíos disponibles</p>
        )}
      </ul>

      <Modal 
        showModal={isModalOpen} 
        closeModal={closeModal} 
        challengeId={selectedChallengeId}
      />
    </div>
  );
};

export default Challenges;