import hatImage from './assets/hat.png';
import dragonImage from './assets/dragon.png';
import shieldImage from './assets/shield.png';

export const PREDEFINED_REWARDS = {
  HAT: {
    id: 'hat',
    name: 'Sombrero Mágico',
    image: hatImage,
    type: 'static',
    renderConfig: {
      offsetX: 50,
      offsetY: -0,
      width: 400,
      height: 400
    }
  },
  DRAGON: {
    id: 'dragon',
    name: 'Dragón Volador',
    image: dragonImage,
    type: 'animated',
    spriteConfig: {
      frameWidth: 1280,
      frameHeight: 1280,
      totalFrames: 2,
      frameSpeed: 30,
      renderWidth: 325,
      renderHeight: 325,
      offsetX: 400,
      offsetY: -200
    }
  },
  SHIELD: {
    id: 'shield',
    name: 'Escudo Protector',
    image: shieldImage,
    type: 'static',
    renderConfig: {
      offsetX: 30,
      offsetY: 100,
      width: 300,
      height: 300
    }
  }
};

export const getRewardConfig = (rewardId) => {
  return Object.values(PREDEFINED_REWARDS).find(reward => reward.id === rewardId);
};