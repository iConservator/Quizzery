import { useState } from 'react';
import { useTestContext } from '../context/TestContext';
import { HiPencil, HiCheck } from "react-icons/hi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

export default function Learn() {
  const { collections } = useTestContext();
  const [selected, setSelected] = useState('');
  const [showAnswerIndexes, setShowAnswerIndexes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  

  const editBtn = {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '0.7rem 1rem',
    marginBottom: '0.5rem',
    marginTop: '0.7rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #E7E7E8',
    cursor: 'pointer',
    backgroundColor: '#E7E7E8',
    transition: 'background-color 0.3s, border-color 0.3s',
  };

  const currentTests = collections[selected] || [];

  const toggleShowAnswer = (index) => {
    setShowAnswerIndexes(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleEditIndex = (index) => {
    setEditIndex(prev => (prev === index ? null : index));
  };

  const updateQuestionText = (index, newText) => {
    currentTests[index].question = newText;
  };

  const updateAnswerText = (qIndex, aIndex, newText) => {
    currentTests[qIndex].answers[aIndex].text = newText;
  };

  const addAnswerOption = (qIndex) => {
    const question = currentTests[qIndex];
    const nextLabel = String.fromCharCode(65 + question.answers.length); // A, B, C...
    question.answers.push({ label: nextLabel, text: 'Новий варіант' });
  };

  const setCorrectIndex = (qIndex, aIndex) => {
    currentTests[qIndex].correctIndex = aIndex;
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Навчання</h2>

      <label>Оберіть колекцію:</label>
      <select
        onChange={e => {
          setSelected(e.target.value);
          setShowAnswerIndexes([]);
          setEditIndex(null);
        }}
        value={selected}
      >
        <option value="">-- Виберіть --</option>
        {Object.keys(collections).map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      {selected && currentTests.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          {currentTests.map((q, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem',
              }}
            >
              {editIndex === i ? (
                <>
                  <textarea
                    value={q.question}
                    onChange={e => updateQuestionText(i, e.target.value)}
                    style={{
                      width: '100%',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      marginBottom: '1rem',
                      resize: 'vertical'
                    }}
                  />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', }}>
                    {q.answers.map((a, j) => (
                      <div
                        key={j}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          // border: '1px solid #ccc',
                          borderRadius: '6px',
                          padding: '0.9rem 1rem',
                          backgroundColor: q.correctIndex === j ? '#d4edda' : '#f9f9f9',
                          cursor: 'default',
                        }}
                      >
                        <input
                          type="radio"
                          name={`correct-${i}`}
                          checked={q.correctIndex === j}
                          onChange={() => setCorrectIndex(i, j)}
                          style={{ marginRight: '0.75rem' }}
                        />
                        <strong style={{ width: '1.5rem' }}>{a.label}.</strong>
                        <input
                          type="text"
                          value={a.text}
                          onChange={e => updateAnswerText(i, j, e.target.value)}
                          style={{ flexGrow: 1, border: 'none', background: 'transparent', fontSize: '1rem' }}
                        />
                         <MdDeleteOutline/> 
                      </div>
                    ))}
            
                  </div>
            

                  <button
                    onClick={() => addAnswerOption(i)}
                    style={{
                      display: 'block',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #aaa',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '1rem',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#555', // ← помилка в hex-коді
                    }}
                    title="Додати нову відповідь"
                  >
                   <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>+</span> Додати відповідь
                  </button>

                
                  <button
                    onClick={() => toggleEditIndex(i)}
                    //Закрити редагування кнопка
                    style={{
                      marginTop: '1rem',
                      width: '100%',
                      backgroundColor: '#E7E7E8',
                      color: 'black',
                      padding: '1rem',
                      border: 'none',
                      borderRadius: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{display : 'flex', alignItems: 'center', fontSize: '16px', cursor: 'pointer', justifyContent: 'center' }}>   
                    <HiCheck style={{ marginRight: '0.5rem' }} size={18} />  
                    <span>Застосувати зміни</span> </div>
                  </button>
                </>
              ) : (
                <>
                  <strong style={{ marginBottom: '1rem', display: 'block' }}>
                    {q.number}. {q.question}
                  </strong>
              
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.answers.map((a, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor:
                            showAnswerIndexes.includes(i) && idx === q.correctIndex
                              ? '#d4edda'
                              : '#f0f0f0',
                          padding: '0.8rem',
                          borderRadius: '4px',
                        }}
                      >
                        <strong>{a.label}.</strong> {a.text}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => toggleEditIndex(i)}
                      style={editBtn}
                    >

                       <div style={{display : 'flex', alignItems: 'center', fontSize: '16px', cursor: 'pointer', justifyContent: 'center' }}>   
                    <HiPencil style={{ marginRight: '0.5rem' }} size={18} />  
                    <span>Редагувати</span> </div>

                    </button>

                    <button
                      onClick={() => toggleShowAnswer(i)}
                      style={editBtn}
                    >

                      
                      {showAnswerIndexes.includes(i) 
                      ? <div style={{display : 'flex', alignItems: 'center', fontSize: '16px', cursor: 'pointer', justifyContent: 'center' }}>   
                    <FaEyeSlash style={{ marginRight: '0.5rem' }} size={18} />  
                    <span>Сховати відповідь</span> </div>  
                    : <div style={{display : 'flex', alignItems: 'center', fontSize: '16px', cursor: 'pointer', justifyContent: 'center' }}>   
                    <FaEye style={{ marginRight: '0.5rem' }} size={18} />  
                    <span>Підглянути</span> </div>}   
                   
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!selected && <div style={{ marginTop: '1rem' }}>Виберіть колекцію для початку навчання.</div>}
    </div>
  );
}
