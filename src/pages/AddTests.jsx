import { useState } from 'react';
import { parseTestText } from '../utils/parseTestText';
import { useTestContext } from '../context/TestContext';

export default function AddTests() {
  const { collections, addCollection, addTestsToCollection, setCorrectAnswer } = useTestContext();
  const [collectionName, setCollectionName] = useState('');
  const [newCollection, setNewCollection] = useState('');
  const [rawText, setRawText] = useState('');
  const [parsedTests, setParsedTests] = useState([]);

  const handleParse = () => {
    const tests = parseTestText(rawText);
    setParsedTests(tests);
    if (newCollection && !collections[newCollection]) {
      addCollection(newCollection);
      setCollectionName(newCollection);
    }
  };

  const handleSave = () => {
    if (collectionName && parsedTests.length > 0) {
      addTestsToCollection(collectionName, parsedTests);
      setRawText('');
      setParsedTests([]);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Додати тести</h2>

      <label>Оберіть або створіть колекцію:</label>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <select onChange={e => setCollectionName(e.target.value)} value={collectionName}>
          <option value="">-- Виберіть --</option>
          {Object.keys(collections).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <input
          placeholder="Нова колекція"
          value={newCollection}
          onChange={e => setNewCollection(e.target.value)}
        />
        <button onClick={() => {
          addCollection(newCollection);
          setCollectionName(newCollection);
        }}>Створити</button>
      </div>

      <textarea
        rows={10}
        style={{ width: '100%' }}
        placeholder="Встав текст тестів сюди..."
        value={rawText}
        onChange={e => setRawText(e.target.value)}
      ></textarea>

      <button onClick={handleParse} style={{ marginTop: '1rem' }}>Розібрати</button>

      {parsedTests.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Клікни на правильну відповідь</h3>
          {parsedTests.map((q, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <strong>{q.number}. {q.question}</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {q.answers.map((a, j) => (
                  <button
                    key={j}
                    onClick={() => {
                      const updated = [...parsedTests];
                      updated[i].correctIndex = j;
                      setParsedTests(updated);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      backgroundColor: q.correctIndex === j ? '#c2f0c2' : '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <strong>{a.label}.</strong> {a.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSave} style={{ marginTop: '1rem' }}>Зберегти в колекцію</button>
        </div>
      )}
    </div>
  );
}