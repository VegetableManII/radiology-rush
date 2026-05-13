import { useState, useEffect, useCallback } from 'react';

type MriType = 'edema' | 'hemorrhage' | 'lipoma';

interface MriQuestion {
  t1: 'bright' | 'dark';
  t2: 'bright' | 'dark';
  answer: MriType;
  image: string;
}

const QUESTIONS: MriQuestion[] = [
  { t1: 'dark', t2: 'bright', answer: 'edema', image: '/assets/mri_game/mri_edema.webp' },
  { t1: 'bright', t2: 'bright', answer: 'hemorrhage', image: '/assets/mri_game/mri_hemorrhage.webp' },
  { t1: 'bright', t2: 'dark', answer: 'lipoma', image: '/assets/mri_game/mri_lipoma.webp' },
];

const MriTypeNames: Record<MriType, string> = {
  edema: '水肿',
  hemorrhage: '出血',
  lipoma: '脂肪瘤',
};

const HINT_TABLE: { t1: 'bright' | 'dark'; t2: 'bright' | 'dark'; label: string; answer: MriType }[] = [
  { t1: 'bright', t2: 'bright', label: '出血', answer: 'hemorrhage' },
  { t1: 'dark', t2: 'bright', label: '水肿', answer: 'edema' },
  { t1: 'bright', t2: 'dark', label: '脂肪瘤', answer: 'lipoma' },
];

interface MriGameProps {
  onComplete: (success: boolean) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MriGame({ onComplete }: MriGameProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<MriQuestion | null>(null);
  const [shuffledTypes, setShuffledTypes] = useState<MriType[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<MriType | null>(null);

  useEffect(() => {
    const randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setCurrentQuestion(randomQuestion);
    setShuffledTypes(shuffleArray([...Object.keys(MriTypeNames)] as MriType[]));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (result || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setResult('fail');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result, isLoading]);

  const handleAnswerClick = useCallback((answer: MriType) => {
    if (result) return;
    setSelectedAnswer(answer);
    setResult(answer === currentQuestion?.answer ? 'success' : 'fail');
  }, [result, currentQuestion]);

  useEffect(() => {
    if (!result) return;

    const timer = setTimeout(() => {
      onComplete(result === 'success');
    }, 1000);
    return () => clearTimeout(timer);
  }, [result, onComplete]);

  if (isLoading || !currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">🧲 MRI室 - 判断病变类型</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            timeLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        {/* T1/T2 Scan Results - Display Only */}
        <div className="bg-gray-100 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">已扫描</span>
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-gray-500">T1</span>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${currentQuestion.t1 === 'bright'
                    ? 'bg-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-gray-700 shadow-inner'
                  }
                `}>
                  {currentQuestion.t1 === 'bright' ? '亮' : '暗'}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-gray-500">T2</span>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${currentQuestion.t2 === 'bright'
                    ? 'bg-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-gray-700 shadow-inner'
                  }
                `}>
                  {currentQuestion.t2 === 'bright' ? '亮' : '暗'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hint Table - 3 Row Grid */}
        <div className="grid grid-cols-3 gap-1 mb-3 text-[10px]">
          {HINT_TABLE.map((item, idx) => (
            <div key={idx} className="flex items-center justify-center gap-1 bg-gray-50 rounded px-1 py-1">
              <div className="flex gap-0.5">
                <div className={`
                  w-3 h-3 rounded-full
                  ${item.t1 === 'bright' ? 'bg-green-500' : 'bg-gray-700'}
                `} />
                <div className={`
                  w-3 h-3 rounded-full
                  ${item.t2 === 'bright' ? 'bg-green-500' : 'bg-gray-700'}
                `} />
              </div>
              <span className="text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Answer Buttons with Images - Shuffled Order */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {shuffledTypes.map((type) => {
            const isCorrect = type === currentQuestion.answer;
            const isSelected = selectedAnswer === type;

            return (
              <button
                key={type}
                onClick={() => handleAnswerClick(type)}
                disabled={result !== null}
                className={`
                  relative aspect-square rounded-xl overflow-hidden transition-all
                  ${result === null ? 'hover:scale-105' : ''}
                  ${result === 'success' && isCorrect ? 'ring-4 ring-green-500' : ''}
                  ${result === 'fail' && isCorrect ? 'ring-4 ring-green-500' : ''}
                  ${result === 'fail' && isSelected && !isCorrect ? 'ring-4 ring-red-500' : ''}
                  ${result === 'fail' && !isCorrect && !isSelected ? 'opacity-50' : ''}
                `}
              >
                <img
                  src={QUESTIONS.find(q => q.answer === type)?.image}
                  alt="MRI scan"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* Result overlay */}
        {result && (
          <div className={`
            absolute inset-0 flex flex-col items-center justify-center rounded-2xl
            ${result === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'}
          `}>
            <div className="text-center text-white">
              <div className="text-5xl mb-2">{result === 'success' ? '✓' : '✗'}</div>
              <div className="text-xl font-bold">
                {result === 'success' ? '正确！' : '错误'}
              </div>
              <div className="text-sm opacity-90 mt-1">
                {MriTypeNames[currentQuestion.answer]}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}