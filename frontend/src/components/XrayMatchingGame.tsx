import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  gridSize: number;
  timeLimit: number;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

interface Tile {
  id: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  isPlaced: boolean;
}

export function XrayMatchingGame({ gridSize, timeLimit, onComplete, onCancel }: Props) {
  const tileSize = 60;
  const gap = 2;
  const maxOffset = 40;

  const createInitialTiles = useMemo(() => {
    const tiles: Tile[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const id = y * gridSize + x;
        const offsetX = (Math.random() - 0.5) * maxOffset * 2;
        const offsetY = (Math.random() - 0.5) * maxOffset * 2;
        tiles.push({
          id,
          currentX: offsetX,
          currentY: offsetY,
          targetX: x * (tileSize + gap),
          targetY: y * (tileSize + gap),
          isPlaced: false,
        });
      }
    }
    return tiles;
  }, [gridSize, tileSize, gap, maxOffset]);

  const [tiles, setTiles] = useState<Tile[]>(createInitialTiles);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isComplete, setIsComplete] = useState(false);

  const checkTilePlaced = (tile: Tile): boolean => {
    const dx = Math.abs(tile.currentX - tile.targetX);
    const dy = Math.abs(tile.currentY - tile.targetY);
    return dx < 15 && dy < 15;
  };

  const moveTile = (id: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 10;
    setTiles(prev => {
      const newTiles = prev.map(tile => {
        if (tile.id !== id) return tile;
        let { currentX, currentY } = tile;
        switch (direction) {
          case 'up': currentY -= step; break;
          case 'down': currentY += step; break;
          case 'left': currentX -= step; break;
          case 'right': currentX += step; break;
        }
        const isPlaced = checkTilePlaced({ ...tile, currentX, currentY });
        return { ...tile, currentX, currentY, isPlaced };
      });

      if (newTiles.every(t => t.isPlaced)) {
        setTimeout(() => {
          setIsComplete(true);
          const perfectTiles = newTiles.filter(t => {
            const dx = Math.abs(t.currentX - t.targetX);
            const dy = Math.abs(t.currentY - t.targetY);
            return dx < 5 && dy < 5;
          });
          const ratio = perfectTiles.length / newTiles.length;
          let score = 1.0;
          if (ratio === 1) score = 2.0;
          else if (ratio > 0.7) score = 1.5;
          onComplete(score);
        }, 300);
      }

      return newTiles;
    });
  };

  const selectedTile = tiles.find(t => !t.isPlaced);

  useEffect(() => {
    if (timeLeft <= 0 && !isComplete) {
      onComplete(0);
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft, isComplete, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>📋</span> 拍片中 - 滑块对齐
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            timeLeft > timeLimit * 0.5 ? 'bg-green-100 text-green-600' :
            timeLeft > timeLimit * 0.25 ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            ⏱️ {timeLeft.toFixed(1)}秒
          </div>
        </div>

        <div className="relative bg-gray-100 rounded-xl p-4 mb-4" style={{
          width: gridSize * (tileSize + gap) + maxOffset * 2 + 20,
          height: gridSize * (tileSize + gap) + maxOffset * 2 + 20,
        }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-300 text-6xl font-bold opacity-20">X光</div>
          </div>
          
          {tiles.map(tile => (
            <motion.div
              key={tile.id}
              initial={false}
              animate={{
                x: tile.currentX + maxOffset,
                y: tile.currentY + maxOffset,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => !tile.isPlaced && setTiles(prev => prev.map(t => 
                t.id === tile.id ? { ...t, isSelected: true } : { ...t, isSelected: false }
              ))}
              className={`absolute cursor-pointer transition-all rounded ${
                tile.isPlaced 
                  ? 'bg-green-200 border-2 border-green-400' 
                  : tile.id === selectedTile?.id
                    ? 'bg-blue-200 border-2 border-blue-400 ring-2 ring-yellow-400'
                    : 'bg-blue-100 border-2 border-blue-300'
              }`}
              style={{
                width: tileSize,
                height: tileSize,
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-xs text-blue-800 font-bold">
                {tile.id + 1}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {['up', 'left', 'right', 'down'].map((dir) => (
            <motion.button
              key={dir}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => selectedTile && moveTile(selectedTile.id, dir as 'up' | 'down' | 'left' | 'right')}
              disabled={!selectedTile}
              className={`w-12 h-12 rounded-lg font-bold text-xl flex items-center justify-center ${
                selectedTile
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'}
            </motion.button>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 mb-4">
          点击选择一个方块，用方向键移动到正确位置
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            已对齐: {tiles.filter(t => t.isPlaced).length}/{tiles.length}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
          >
            跳过 (−50%分数)
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}