import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import '../styles/CharacterCanvas.css';
import spriteSheetPath from '../images/spritesheet.png';
import backgroundImagePath from '../images/caracterfound.jpg';

const REWARD_CONFIGS = {
  'hat': {
    type: 'static',
    renderConfig: {
      offsetX: 50,
      offsetY: -0,
      width: 400,
      height: 400
    }
  },
  'dragon': {
    type: 'animated',
    spriteConfig: {
      frameWidth: 1280,
      frameHeight: 1280,
      totalFrames: 2,
      frameSpeed: 20,
      renderWidth: 325,
      renderHeight: 325,
      offsetX: 400,
      offsetY: -200
    }
  },
  'shield': {
    type: 'static',
    renderConfig: {
      offsetX: 30,
      offsetY: 100,
      width: 300,
      height: 300
    }
  }
};

function CharacterCanvas() {
  const canvasRef = useRef(null);
  const spriteSheetRef = useRef(new Image());
  const backgroundImageRef = useRef(new Image());
  const [unlockedRewards, setUnlockedRewards] = useState([]);
  const [equippedRewards, setEquippedRewards] = useState([]);
  const [rewardFrames, setRewardFrames] = useState({});
  const { user, isAuthenticated } = useAuth();

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 900;
  const FRAME_WIDTH = 500;
  const FRAME_HEIGHT = 500;
  const totalFrames = 2;
  let currentFrame = 0;
  let frameCounter = 0;
  const frameSpeed = 120;

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnlockedRewards();
      fetchEquippedRewards();
    }
  }, [isAuthenticated]);

  const fetchUnlockedRewards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/rewards/unlocked', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnlockedRewards(response.data);
    } catch (error) {
      console.error('Error al obtener recompensas:', error);
    }
  };

  const fetchEquippedRewards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/rewards/equipped', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const equipped = await Promise.all(response.data.map(async (reward) => {
        const rewardImage = new Image();
        rewardImage.src = `http://localhost:3000${reward.image}`;
        
        // Esperar a que la imagen se cargue
        await new Promise((resolve) => {
          rewardImage.onload = resolve;
          rewardImage.onerror = resolve; 
        });
        
        // Inicializar frames si es una recompensa animada
        if (REWARD_CONFIGS[reward.type]?.type === 'animated') {
          setRewardFrames(prev => ({
            ...prev,
            [reward.id]: {
              currentFrame: 0,
              frameCounter: 0
            }
          }));
        }
        
        return { ...reward, image: rewardImage };
      }));
      
      setEquippedRewards(equipped);
    } catch (error) {
      console.error('Error al cargar recompensas equipadas:', error);
    }
  };

  const toggleReward = async (rewardId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/rewards/equip',
        { rewardId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
  
      if (response.data.message.includes('desequipada')) {
        setEquippedRewards(prev => prev.filter(r => r.id !== rewardId));
        // Limpiar los frames de la recompensa desequipada
        setRewardFrames(prev => {
          const newFrames = { ...prev };
          delete newFrames[rewardId];
          return newFrames;
        });
        
        Swal.fire({
          title: '¡Recompensa desequipada!',
          text: 'Has desequipado la recompensa',
          icon: 'success'
        });
      } else {
        const reward = unlockedRewards.find(r => r.id === rewardId);
        const rewardImage = new Image();
        rewardImage.src = `http://localhost:3000${reward.image}`;
        
        // Asegurarnos de que la imagen se cargue antes de mostrarla
        await new Promise((resolve) => {
          rewardImage.onload = resolve;
        });
  
        const config = REWARD_CONFIGS[reward.type];
        if (config?.type === 'animated') {
          setRewardFrames(prev => ({
            ...prev,
            [reward.id]: {
              currentFrame: 0,
              frameCounter: 0
            }
          }));
        }
        
        setEquippedRewards(prev => [...prev, { ...reward, image: rewardImage }]);
        
        Swal.fire({
          title: '¡Recompensa equipada!',
          text: `Has equipado: ${reward.name}`,
          icon: 'success'
        });
      }
  
      // Recargar las recompensas equipadas
      await fetchEquippedRewards();
  
    } catch (error) {
      console.error('Error al gestionar recompensa:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Error al gestionar la recompensa',
        icon: 'error'
      });
    }
  };

  const drawReward = (ctx, reward, characterX, characterY) => {
    if (!reward.image.complete) return;
  
    const config = REWARD_CONFIGS[reward.type];
    if (!config) return;
  
    if (config.type === 'static') {
      const { offsetX, offsetY, width, height } = config.renderConfig;
      ctx.drawImage(
        reward.image,
        characterX + offsetX,
        characterY + offsetY,
        width,
        height
      );
    } else if (config.type === 'animated') {
      const {
        frameWidth,
        frameHeight,
        totalFrames,
        frameSpeed,
        renderWidth,
        renderHeight,
        offsetX,
        offsetY
      } = config.spriteConfig;
  
      const frameData = rewardFrames[reward.id];
      // Verificar si existen los datos de frames
      if (!frameData) {
        setRewardFrames(prev => ({
          ...prev,
          [reward.id]: {
            currentFrame: 0,
            frameCounter: 0
          }
        }));
        return;
      }
  
      // Draw the current frame
      ctx.drawImage(
        reward.image,
        frameData.currentFrame * frameWidth, 0,
        frameWidth, frameHeight,
        characterX + offsetX,
        characterY + offsetY,
        renderWidth,
        renderHeight
      );
  
      // Update frame counters
      requestAnimationFrame(() => {
        setRewardFrames(prev => {
          const currentFrameData = prev[reward.id];
          if (!currentFrameData) return prev;
  
          const newFrameCounter = (currentFrameData.frameCounter + 1) % frameSpeed;
          const newCurrentFrame = newFrameCounter === 0 
            ? (currentFrameData.currentFrame + 1) % totalFrames 
            : currentFrameData.currentFrame;
  
          return {
            ...prev,
            [reward.id]: {
              currentFrame: newCurrentFrame,
              frameCounter: newFrameCounter
            }
          };
        });
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    spriteSheetRef.current.src = spriteSheetPath;
    backgroundImageRef.current.src = backgroundImagePath;

    spriteSheetRef.current.onload = () => {
      requestAnimationFrame(animationLoop);
    };

    function animationLoop() {
      drawCharacter(ctx);
      requestAnimationFrame(animationLoop);
    }

    function drawCharacter(ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar fondo
      if (backgroundImageRef.current.complete) {
        ctx.drawImage(backgroundImageRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Animación del personaje
      const sx = currentFrame * FRAME_WIDTH;
      const characterX = canvas.width / 2 - FRAME_WIDTH / 2;
      const characterY = canvas.height / 1.5 - FRAME_HEIGHT / 2;

      ctx.drawImage(spriteSheetRef.current, sx, 0, FRAME_WIDTH, FRAME_HEIGHT, characterX, characterY, FRAME_WIDTH, FRAME_HEIGHT);

      frameCounter++;
      if (frameCounter >= frameSpeed) {
        currentFrame = (currentFrame + 1) % totalFrames;
        frameCounter = 0;
      }

      // Dibujar recompensas equipadas
      equippedRewards.forEach(reward => {
        drawReward(ctx, reward, characterX, characterY);
      });
    }
  }, [equippedRewards, rewardFrames]);

  return (
    <div className="character-container">
      <div className="sidebar">
        <h3>RECOMPENSAS DESBLOQUEADAS</h3>
        {unlockedRewards.map(reward => (
          <div key={reward.id} className="reward-item">
            <p>{reward.name}</p>
            <p className="challenge-title">De: {reward.challengeTitle}</p>
            <button 
              onClick={() => toggleReward(reward.id)}
              className={`equip-button ${equippedRewards.some(r => r.id === reward.id) ? 'equipped' : ''}`}
            >
              {equippedRewards.some(r => r.id === reward.id) ? 'Desequipar' : 'Equipar'}
            </button>
          </div>
        ))}
      </div>

      <div className="canvas-wrapper">
        <h1>ADAN</h1>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
      </div>
    </div>
  );
}

export default CharacterCanvas;
