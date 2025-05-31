import { useState } from "react";
import { parseTestText } from "../utils/parseTestText";
import { useTestContext } from "../context/TestContext";
import { HiPencil, HiCheck } from "react-icons/hi";

export default function AddTests() {
  const { collections, addCollection, addTestsToCollection } = useTestContext();
  const [collectionName, setCollectionName] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsedTests, setParsedTests] = useState([]);

  // Для контролю режиму редагування по кожному питанню
  const [editIndex, setEditIndex] = useState(null);

  const baseBtn = {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "0.7rem 1rem",
    marginBottom: "0.5rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    cursor: "pointer",
    backgroundColor: "#f9f9f9",
    transition: "background-color 0.3s, border-color 0.3s",
  };

  const editBtn = {
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "0.7rem 1rem",
    marginBottom: "0.5rem",
    marginTop: "0.7rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #E7E7E8",
    cursor: "pointer",
    backgroundColor: "#E7E7E8",
    transition: "background-color 0.3s, border-color 0.3s",
  };

  const cardStyle = {
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    marginBottom: "1.5rem",
  };

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
      setRawText("");
      setParsedTests([]);
      setEditIndex(null);
    }
  };

  // Оновлення тексту питання при редагуванні
  const updateQuestionText = (index, newText) => {
    const updated = [...parsedTests];
    updated[index].question = newText;
    setParsedTests(updated);
  };

  // Оновлення тексту варіанту відповіді
  const updateAnswerText = (qIndex, aIndex, newText) => {
    const updated = [...parsedTests];
    updated[qIndex].answers[aIndex].text = newText;
    setParsedTests(updated);
  };

  // Додавання нового варіанту відповіді
  const addAnswer = (qIndex) => {
    const updated = [...parsedTests];
    updated[qIndex].answers.push({
      label: String.fromCharCode(65 + updated[qIndex].answers.length),
      text: "Ваша відповідь",
    });
    setParsedTests(updated);
  };

  // Оновлення індексу правильної відповіді
  const setCorrectAnswer = (qIndex, aIndex) => {
    const updated = [...parsedTests];
    updated[qIndex].correctIndex = aIndex;
    setParsedTests(updated);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Додати тести</h2>

      <label>Оберіть або створіть колекцію:</label>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <select
          onChange={(e) => setCollectionName(e.target.value)}
          value={collectionName}
        >
          <option value="">-- Виберіть --</option>
          {collections.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Нова колекція"
          value={newCollection}
          onChange={(e) => setNewCollection(e.target.value)}
        />
        <button
          onClick={() => {
            addCollection(newCollection);
            setCollectionName(newCollection);
          }}
        >
          Створити
        </button>
      </div>

      <textarea
        rows={10}
        style={{ width: "100%" }}
        placeholder="Встав текст тестів сюди..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      ></textarea>

      <button onClick={handleParse} style={{ marginTop: "1rem" }}>
        Розібрати
      </button>

      {parsedTests.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Клікни на правильну відповідь</h3>
          {parsedTests.map((q, i) => (
            <div key={i} style={cardStyle}>
              {editIndex === i ? (
                <>
                  {/* Редагування питання */}
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestionText(i, e.target.value)}
                    style={{
                      width: "100%",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      resize: "vertical",
                    }}
                  />

                  {/* Відповіді */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {q.answers.map((a, j) => (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          backgroundColor:
                            q.correctIndex === j ? "#d4edda" : "#f9f9f9",
                          cursor: "default",
                        }}
                      >
                        <input
                          type="radio"
                          name={`correct-${i}`}
                          checked={q.correctIndex === j}
                          onChange={() => setCorrectAnswer(i, j)}
                          style={{ marginRight: "0.75rem" }}
                        />
                        <strong style={{ width: "1.5rem" }}>{a.label}.</strong>
                        <input
                          type="text"
                          value={a.text}
                          onChange={(e) =>
                            updateAnswerText(i, j, e.target.value)
                          }
                          style={{
                            flexGrow: 1,
                            border: "none",
                            background: "transparent",
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                    ))}

                    {/* Контейнер для додавання нової відповіді */}
                    <button
                      onClick={() => addAnswer(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px dashed #aaa",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        fontSize: "1rem",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#555",
                      }}
                      title="Додати нову відповідь"
                    >
                      <span
                        style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}
                      >
                        +
                      </span>{" "}
                      Додати відповідь
                    </button>
                  </div>

                  <button
                    onClick={() => setEditIndex(null)}
                    //Закрити редагування кнопка
                    style={{
                      marginTop: "1rem",
                      width: "100%",
                      backgroundColor: "#E7E7E8",
                      color: "black",
                      padding: "1rem",
                      border: "none",
                      borderRadius: "16px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "16px",
                        cursor: "pointer",
                        justifyContent: "center",
                      }}
                    >
                      <HiCheck style={{ marginRight: "0.5rem" }} size={18} />
                      <span>Застосувати зміни</span>{" "}
                    </div>
                  </button>
                </>
              ) : (
                <>
                  {/* Відображення питання */}
                  <strong style={{ marginBottom: "1rem", display: "block" }}>
                    {q.number}. {q.question}
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {q.answers.map((a, j) => (
                      <button
                        key={j}
                        onClick={() => setCorrectAnswer(i, j)}
                        style={{
                          ...baseBtn,
                          backgroundColor:
                            q.correctIndex === j ? "#d4edda" : "#f9f9f9",
                          borderColor:
                            q.correctIndex === j ? "#28a745" : "#ccc",
                        }}
                      >
                        <strong>{a.label}.</strong> {a.text}
                      </button>
                    ))}
                  </div>

                  {/* Кнопка редагування по ширині контейнера */}
                  <button onClick={() => setEditIndex(i)} style={editBtn}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "16px",
                        cursor: "pointer",
                        justifyContent: "center",
                      }}
                    >
                      <HiPencil style={{ marginRight: "0.5rem" }} size={18} />
                      <span>Редагувати</span>{" "}
                    </div>
                  </button>
                </>
              )}
            </div>
          ))}
          <button onClick={handleSave} style={{ marginTop: "1rem" }}>
            Зберегти в колекцію
          </button>
        </div>
      )}
    </div>
  );
}
