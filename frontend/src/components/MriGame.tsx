import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { playSFX } from '../hooks/useSound';

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
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(10);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<MriQuestion | null>(null);
  const [shuffledTypes, setShuffledTypes] = useState<MriType[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<MriType | null>(null);

  // 使用 useMemo 避免每次渲染都重新创建对象
  const mriTypeNames = useMemo<Record<MriType, string>>(() => ({
    edema: t('minigame.mri.edema'),
    hemorrhage: t('minigame.mri.hemorrhage'),
    lipoma: t('minigame.mri.lipoma'),
  }), [t]);

  // 只在初始化时设置一次题目和选项顺序
  useEffect(() => {
    const randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setCurrentQuestion(randomQuestion);
    setShuffledTypes(shuffleArray(['edema', 'hemorrhage', 'lipoma']));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (result || isLoading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setResult('fail'); return 0; }
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
    if (result === 'success') playSFX('sfx_minigame_success');
    else if (result === 'fail') playSFX('sfx_minigame_fail');
  }, [result]);

  useEffect(() => {
    if (!result) return;
    setTimeout(() => { onComplete(result === 'success'); }, 1000);
  }, [result, onComplete]);

  if (isLoading || !currentQuestion) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
        <span style={{ color: 'white' }}>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', padding: '1rem', maxWidth: 'min(28rem, 100%)', width: '100%', margin: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/assets/icons/icon_mri.webp" alt="" style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }} />
            {t('minigame.mri.title')}
          </h2>
          <div style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 700,
            backgroundColor: timeLeft <= 3 ? '#fef2f2' : '#eff6ff',
            color: timeLeft <= 3 ? '#dc2626' : '#2563eb',
          }}>
            <span style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)', marginRight: '0.25rem' }}>⏱️</span> {timeLeft}s
          </div>
        </div>

        {/*
          已扫描区域：上方显示T1/T2信号灯，下方显示3种组合对照
        */}
        <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', color: '#6b7280', fontWeight: 500, flexShrink: 0, paddingTop: '0.125rem' }}>{t('minigame.mri.scanned')}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              {/* 竖排提示：信号灯 + 病名 */}
              {[
                { t1: 'bright', t2: 'bright', label: t('minigame.mri.hemorrhage') },
                { t1: 'dark', t2: 'bright', label: t('minigame.mri.edema') },
                { t1: 'bright', t2: 'dark', label: t('minigame.mri.lipoma') },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <div style={{
                      width: 'clamp(0.5rem, 1.5vw, 0.625rem)', height: 'clamp(0.5rem, 1.5vw, 0.625rem)', borderRadius: '50%',
                      backgroundColor: item.t1 === 'bright' ? '#22c55e' : '#4b5567',
                    }} />
                    <div style={{
                      width: 'clamp(0.5rem, 1.5vw, 0.625rem)', height: 'clamp(0.5rem, 1.5vw, 0.625rem)', borderRadius: '50%',
                      backgroundColor: item.t2 === 'bright' ? '#22c55e' : '#4b5567',
                    }} />
                  </div>
                  <span style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)', color: '#4b5563' }}>{item.label}</span>
                </div>
              ))}
            </div>
            {/* T1 / T2 亮灯 */}
            <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
              {(['t1', 't2'] as const).map((scan) => {
                const val = scan === 't1' ? currentQuestion.t1 : currentQuestion.t2;
                return (
                  <div key={scan} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
                    <span style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.625rem)', fontWeight: 700, color: '#6b7280' }}>{scan.toUpperCase()}</span>
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
                      ...(val === 'bright'
                        ? { backgroundColor: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }
                        : { backgroundColor: '#4b5567', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }),
                    }}>
                      {val === 'bright' ? t('minigame.mri.bright') : t('minigame.mri.dark')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/*
          病状选择按钮：图片 + 病状名称
        */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {shuffledTypes.map((type) => {
            const isCorrect = type === currentQuestion.answer;
            const isSelected = selectedAnswer === type;

            return (
              <button
                key={type}
                onClick={() => handleAnswerClick(type)}
                disabled={result !== null}
                style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  transition: 'all',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(result === null ? { cursor: 'pointer' } : { cursor: 'default' }),
                  ...(result !== null ? { transform: 'scale(1.03)' } : {}),
                  ...(result === 'success' && isCorrect ? { outline: '4px solid #22c55e', outlineOffset: '-2px' } : {}),
                  ...(result === 'fail' && isCorrect ? { outline: '4px solid #22c55e', outlineOffset: '-2px' } : {}),
                  ...(result === 'fail' && isSelected && !isCorrect ? { outline: '4px solid #ef4444', outlineOffset: '-2px' } : {}),
                  ...(result === 'fail' && !isCorrect && !isSelected ? { opacity: 0.5 } : {}),
                }}
              >
                <img
                  src={QUESTIONS.find(q => q.answer === type)?.image}
                  alt={mriTypeNames[type]}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                />
                <div style={{
                  width: '100%',
                  padding: '0.25rem',
                  textAlign: 'center',
                  fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
                  fontWeight: 700,
                  color: 'white',
                  backgroundColor: '#374151',
                }}>
                  {mriTypeNames[type]}
                </div>
              </button>
            );
          })}
        </div>

        {result && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem',
            backgroundColor: result === 'success' ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3rem)', marginBottom: '0.5rem', fontWeight: 700 }}>{result === 'success' ? '✓' : '✗'}</div>
              <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700 }}>{result === 'success' ? t('minigame.mri.success') : t('minigame.mri.fail')}</div>
              <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', opacity: 0.9, marginTop: '0.25rem' }}>{mriTypeNames[currentQuestion.answer]}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}