import { useState } from 'react';
import { useTestContext } from '../context/TestContext';

export default function Learn() {
  const { collections } = useTestContext();
  const [selected, setSelected] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentTests = collections[selected] || [];

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex(prev => (prev + 1 < currentTests.length ? prev + 1 : 0));
  };

  if (!Object.keys(collections).length) {
    return <div style={{ padding: '1rem' }}>⛔ Немає колекцій. Додайте тести.</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Навчання</h2>

      <label>Оберіть колекцію:</label>
      <select onChange={e => {
        setSelected(e.target.value);
        setCurrentIndex(0);
        setShowAnswer(false);
      }} value={selected}>
        <option value="">-- Виберіть --</option>
        {Object.keys(collections).map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      {selected && currentTests.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <strong>{currentTests[currentIndex].number}. {currentTests[currentIndex].question}</strong>

            <div style={{ marginTop: '1rem' }}>
              {currentTests[currentIndex].answers.map((a, idx) => (
                <div key={idx} style={{
                  backgroundColor: showAnswer && idx === currentTests[currentIndex].correctIndex
                    ? '#d4edda'
                    : '#f0f0f0',
                  padding: '0.5rem',
                  marginBottom: '0.25rem',
                  borderRadius: '4px'
                }}>
                  <strong>{a.label}.</strong> {a.text}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowAnswer(true)}>Показати відповідь</button>
            <button onClick={handleNext}>Наступне питання</button>
          </div>
        </div>
      )}
    </div>
  );
}