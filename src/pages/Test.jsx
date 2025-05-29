import { useState, useEffect, useRef } from 'react';
import { useTestContext } from '../context/TestContext';

export default function Test() {
  const { collections } = useTestContext();
  const [selected, setSelected] = useState('');
  const [shuffledTests, setShuffledTests] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [status, setStatus] = useState(null); // 'correct', 'wrong'
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // Загальний таймер, наприклад 120 сек
  const [animationKey, setAnimationKey] = useState(0);
  const timerId = useRef(null);


  // Ініціалізація тесту при виборі колекції
  useEffect(() => {
    if (selected && collections[selected]) {
      const copy = [...collections[selected]];
      shuffleArray(copy);
      setShuffledTests(copy);
      resetTest();
    }
  }, [selected]);

  // Запуск загального таймера при старті тесту
  useEffect(() => {
    if (!selected || finished) {
      clearInterval(timerId.current);
      return;
    }

    setTimeLeft(120); // Скидаємо загальний таймер на 120 сек (2 хв)

    clearInterval(timerId.current);
    timerId.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerId.current);
          setFinished(true); // Завершуємо тест коли час вийшов
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerId.current);
  }, [selected, finished]);

  const resetTest = () => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setChosen(null);
    setStatus(null);
    setShowCorrectAnswers(false);
    setTimeLeft(120);
  };

  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  const handleClick = (idx) => {
    if (chosen !== null && status === 'correct') return;
  
    const correct = shuffledTests[currentIndex].correctIndex;
  
    if (idx === correct) {
      setStatus('correct');
      setScore((prev) => prev + 1);
      setChosen(idx);
      setAnimationKey(prev => prev + 1); // ✅ перезапуск анімації
  
      setTimeout(() => {
        const next = currentIndex + 1;
        if (next < shuffledTests.length) {
          setCurrentIndex(next);
          setChosen(null);
          setStatus(null);
          setAnimationKey(prev => prev + 1); // ✅ для fadeIn наступної картки
        } else {
          setFinished(true);
        }
      }, 1000);
    } else {
      setStatus('wrong');
      setChosen(idx);
      setAnimationKey(prev => prev + 1); // ✅ перезапуск shake
    }
  };

  const getButtonStyle = (idx) => {
    const correct = shuffledTests[currentIndex]?.correctIndex;

    if (finished && showCorrectAnswers) {
      return idx === correct
        ? { ...baseBtn, backgroundColor: '#d4edda', borderColor: '#28a745' }
        : baseBtn;
    }

    if (chosen === null) return baseBtn;

    if (idx === chosen && status === 'wrong') {
      return { ...baseBtn, backgroundColor: '#f8d7da', borderColor: '#dc3545' };
    }

    if (idx === chosen && status === 'correct') {
      return { ...baseBtn, backgroundColor: '#d4edda', borderColor: '#28a745' };
    }

    return baseBtn;
  };

  // Прогрес-бар у відсотках
  const progressPercent = shuffledTests.length
  ? finished
    ? 100
    : (currentIndex / shuffledTests.length) * 100
  : 0;

  // Формат часу mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>🧪 Тестування</h2>

      {/* Прогрес-бар */}
      {selected && (
        <div style={progressContainer}>
          <div style={{ ...progressBar, width: `${progressPercent}%` }} />
          <div style={timerStyle}>{formatTime(timeLeft)}</div>
        </div>
      )}

      {!selected && (
        <div>
          <label>Оберіть колекцію:</label>
          <select onChange={(e) => setSelected(e.target.value)} value={selected}>
            <option value="">-- Виберіть --</option>
            {Object.keys(collections).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selected && !finished && shuffledTests.length > 0 && (
       <div
       key={animationKey}
       style={{
         ...cardStyle,
         animation:
           status === 'wrong'
             ? 'shake 0.4s'
             : status === 'correct'
             ? 'pulse 0.6s'
             : 'fadeIn 0.4s',
       }}
     >
          <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
            {shuffledTests[currentIndex].number}. {shuffledTests[currentIndex].question}
          </div>

          {shuffledTests[currentIndex].answers.map((a, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              style={getButtonStyle(idx)}
              disabled={chosen !== null && status === 'correct'}
            >
              <strong>{a.label}.</strong> {a.text}
            </button>
          ))}

          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#555' }}>
            Прогрес: {currentIndex + 1} / {shuffledTests.length}
          </div>
        </div>
      )}

      {finished && (
        <div>
          <h3>✅ Завершено</h3>
          <p>Результат: {score} з {shuffledTests.length}</p>

          {!showCorrectAnswers && (
            <button onClick={() => setShowCorrectAnswers(true)} style={{ marginRight: '1rem' }}>
              Переглянути правильні відповіді
            </button>
          )}
          <button onClick={resetTest}>Пройти ще раз</button>

          {showCorrectAnswers && (
            <div style={{ marginTop: '2rem' }}>
              <h4>Правильні відповіді:</h4>
              {shuffledTests.map((test, idx) => (
                <div key={idx} style={{ marginBottom: '1rem' }}>
                  <div>
                    <strong>{test.number}.</strong> {test.question}
                  </div>
                  <div style={{ marginLeft: '1rem', color: '#28a745' }}>
                    ✅ {test.answers[test.correctIndex].label}. {test.answers[test.correctIndex].text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

const cardStyle = {
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: '10px',
  padding: '1.5rem',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  marginTop: '2rem',
};

const baseBtn = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '0.7rem 1rem',
  marginBottom: '0.5rem',
  fontSize: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  cursor: 'pointer',
  backgroundColor: '#f9f9f9',
  transition: 'background-color 0.3s, border-color 0.3s',
};

const progressContainer = {
  position: 'relative',
  height: '25px',
  backgroundColor: '#e9ecef',
  borderRadius: '12px',
  marginBottom: '1rem',
  overflow: 'hidden',
};

const progressBar = {
  height: '100%',
  backgroundColor: '#007bff',
  transition: 'width 0.4s ease',
};

const timerStyle = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontWeight: 'bold',
  color: '#333',
  userSelect: 'none',
};