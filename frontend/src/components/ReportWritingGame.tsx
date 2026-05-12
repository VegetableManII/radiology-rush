import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  patientType: 'xray' | 'ct' | 'mri' | 'emergency';
  onComplete: (correctCount: number, totalCount: number) => void;
  onCancel: () => void;
}

interface BodyPart {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const BODY_PARTS: BodyPart[] = [
  { id: 'head', name: '头部', x: 85, y: 5, width: 30, height: 40 },
  { id: 'neck', name: '颈部', x: 90, y: 45, width: 20, height: 15 },
  { id: 'chest', name: '胸部', x: 70, y: 60, width: 60, height: 50 },
  { id: 'leftLung', name: '左肺', x: 72, y: 65, width: 25, height: 40 },
  { id: 'rightLung', name: '右肺', x: 103, y: 65, width: 25, height: 40 },
  { id: 'heart', name: '心脏', x: 88, y: 70, width: 25, height: 30 },
  { id: 'abdomen', name: '腹部', x: 70, y: 110, width: 60, height: 45 },
  { id: 'liver', name: '肝脏', x: 100, y: 115, width: 28, height: 25 },
  { id: 'leftArm', name: '左臂', x: 40, y: 65, width: 25, height: 70 },
  { id: 'rightArm', name: '右臂', x: 135, y: 65, width: 25, height: 70 },
  { id: 'spine', name: '脊柱', x: 92, y: 55, width: 16, height: 100 },
  { id: 'pelvis', name: '骨盆', x: 72, y: 155, width: 56, height: 30 },
  { id: 'leftLeg', name: '左腿', x: 72, y: 185, width: 25, height: 70 },
  { id: 'rightLeg', name: '右腿', x: 103, y: 185, width: 25, height: 70 },
];

const TIME_LIMITS: Record<string, number> = {
  xray: 10,
  ct: 8,
  mri: 8,
  emergency: 5,
};

const REQUIRED_COUNTS: Record<string, number> = {
  xray: 2,
  ct: 3,
  mri: 3,
  emergency: 1,
};

export function ReportWritingGame({ patientType, onComplete, onCancel }: Props) {
  const [targetParts, setTargetParts] = useState<BodyPart[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[patientType]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const count = REQUIRED_COUNTS[patientType];
    const shuffled = [...BODY_PARTS].sort(() => Math.random() - 0.5);
    setTargetParts(shuffled.slice(0, count));
    setTimeLeft(TIME_LIMITS[patientType]);
  }, [patientType]);

  useEffect(() => {
    if (timeLeft <= 0 && !isComplete) {
      setIsComplete(true);
      onComplete(selectedParts.length, targetParts.length);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft, isComplete, selectedParts, targetParts, onComplete]);

  const handlePartClick = (part: BodyPart) => {
    if (isComplete) return;
    
    if (selectedParts.includes(part.id)) {
      setSelectedParts(prev => prev.filter(id => id !== part.id));
    } else {
      const newSelected = [...selectedParts, part.id];
      setSelectedParts(newSelected);
      
      if (newSelected.length === targetParts.length) {
        setIsComplete(true);
        const correctCount = newSelected.filter(id => 
          targetParts.some(t => t.id === id)
        ).length;
        onComplete(correctCount, targetParts.length);
      }
    }
  };

  const isTarget = (partId: string) => targetParts.some(t => t.id === partId);
  const isCorrect = (partId: string) => selectedParts.includes(partId);

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
            <span>📝</span> 撰写影像报告
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            timeLeft > TIME_LIMITS[patientType] * 0.5 ? 'bg-green-100 text-green-600' :
            timeLeft > TIME_LIMITS[patientType] * 0.25 ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            ⏱️ {timeLeft.toFixed(1)}秒
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <div className="text-sm text-gray-600 mb-2">请在下方人体图上标注：</div>
          <div className="flex gap-2 flex-wrap">
            {targetParts.map(part => (
              <motion.span
                key={part.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isCorrect(part.id) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}
              >
                {part.name}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="relative bg-gray-100 rounded-xl p-4 mb-4">
          <svg viewBox="0 0 200 280" className="w-full max-w-xs mx-auto">
            <rect x="85" y="5" width="30" height="40" rx="15" 
              className={`cursor-pointer transition-all ${
                selectedParts.includes('head') 
                  ? isTarget('head') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[0])}
            />
            <rect x="90" y="45" width="20" height="15" rx="5"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('neck')
                  ? isTarget('neck') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[1])}
            />
            <rect x="70" y="60" width="60" height="50" rx="8"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('chest')
                  ? isTarget('chest') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[2])}
            />
            <rect x="40" y="65" width="25" height="70" rx="8"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('leftArm')
                  ? isTarget('leftArm') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[8])}
            />
            <rect x="135" y="65" width="25" height="70" rx="8"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('rightArm')
                  ? isTarget('rightArm') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[9])}
            />
            <rect x="70" y="110" width="60" height="45" rx="8"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('abdomen')
                  ? isTarget('abdomen') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[6])}
            />
            <rect x="72" y="185" width="25" height="70" rx="8"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('leftLeg')
                  ? isTarget('leftLeg') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[12])}
            />
            <rect x="103" y="185" width="25" height="70" rx="8"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('rightLeg')
                  ? isTarget('rightLeg') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-300 hover:fill-gray-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[13])}
            />
            
            <rect x="72" y="65" width="25" height="40" rx="4"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('leftLung')
                  ? isTarget('leftLung') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-pink-200 hover:fill-pink-300'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[3])}
            />
            <rect x="103" y="65" width="25" height="40" rx="4"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('rightLung')
                  ? isTarget('rightLung') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-pink-200 hover:fill-pink-300'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[4])}
            />
            <rect x="88" y="70" width="25" height="30" rx="4"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('heart')
                  ? isTarget('heart') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-red-300 hover:fill-red-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[5])}
            />
            <rect x="100" y="115" width="28" height="25" rx="4"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('liver')
                  ? isTarget('liver') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-purple-300 hover:fill-purple-400'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[7])}
            />
            <rect x="92" y="55" width="16" height="100" rx="4"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('spine')
                  ? isTarget('spine') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-yellow-200 hover:fill-yellow-300'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[10])}
            />
            <rect x="72" y="155" width="56" height="30" rx="4"
              className={`cursor-pointer transition-all ${
                selectedParts.includes('pelvis')
                  ? isTarget('pelvis') ? 'fill-green-400' : 'fill-red-400'
                  : 'fill-gray-400 hover:fill-gray-500'
              }`}
              onClick={() => handlePartClick(BODY_PARTS[11])}
            />
          </svg>
        </div>

        <div className="text-center text-sm text-gray-500 mb-4">
          点击人体图上需要标注的部位
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            已选择: {selectedParts.length}/{targetParts.length}
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