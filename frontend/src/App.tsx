import { useEffect } from 'react';
import { Game } from './components/Game';

// 预加载场景图片 (WebP格式)
const SCENE_IMAGES = [
  '/assets/scenes/webp/main_bg.webp',
  '/assets/scenes/webp/dr_room.webp',
  '/assets/scenes/webp/ct_room.webp',
  '/assets/scenes/webp/mri_room.webp',
  '/assets/scenes/webp/waiting_room.webp',
];

function preloadImages(urls: string[]) {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

function App() {
  useEffect(() => {
    preloadImages(SCENE_IMAGES);
  }, []);

  return <Game />;
}

export default App;