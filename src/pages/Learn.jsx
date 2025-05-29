import { useState } from "react";
import { useTestContext } from "../context/TestContext";
import { HiPencil, HiCheck } from "react-icons/hi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdDeleteOutline, MdDelete } from "react-icons/md";
import { useLocation } from "react-router-dom";

export default function Learn() {
  const { collections, setCollections, deleteTest } = useTestContext();
  const location = useLocation();
  const [selected, setSelected] = useState(
    location.state?.selectedCategory || ""
  );
  const [showAnswerIndexes, setShowAnswerIndexes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);

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

  const currentCollection = collections.find((c) => c.name === selected);
  const currentTests = currentCollection?.tests || [];

  const removeAnswerOption = (qIndex, aIndex) => {
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.name !== selected) return collection;
        const tests = [...collection.tests];
        const question = { ...tests[qIndex] };
        if (question.answers.length <= 2) return collection; // Мінімум 2 варіантb
        const newAnswers = question.answers.filter((_, idx) => idx !== aIndex);

        // Перегенерувати label: A, B, C, ...
        const relabeled = newAnswers.map((ans, i) => ({
          ...ans,
          label: String.fromCharCode(65 + i),
        }));

        question.answers = relabeled;

        // Якщо видалено правильну відповідь — скинути correctIndex
        if (question.correctIndex === aIndex) {
          question.correctIndex = null;
        } else if (question.correctIndex > aIndex) {
          question.correctIndex--; // Зсунути correctIndex
        }

        tests[qIndex] = question;
        return { ...collection, tests };
      })
    );
  };

  const toggleShowAnswer = (index) => {
    setShowAnswerIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleEditIndex = (index) => {
    setEditIndex((prev) => (prev === index ? null : index));
  };

  const updateQuestionText = (index, newText) => {
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.name !== selected) return collection;
        const updatedTests = [...collection.tests];
        updatedTests[index] = { ...updatedTests[index], question: newText };
        return { ...collection, tests: updatedTests };
      })
    );
  };

  const updateAnswerText = (qIndex, aIndex, newText) => {
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.name !== selected) return collection;
        const tests = [...collection.tests];
        const answers = [...tests[qIndex].answers];
        answers[aIndex] = { ...answers[aIndex], text: newText };
        tests[qIndex] = { ...tests[qIndex], answers };
        return { ...collection, tests };
      })
    );
  };

  const addAnswerOption = (qIndex) => {
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.name !== selected) return collection;
        const tests = [...collection.tests];
        const question = { ...tests[qIndex] };
        const answers = [...question.answers];
        const nextLabel = String.fromCharCode(65 + answers.length);
        answers.push({ label: nextLabel, text: "Новий варіант" });
        question.answers = answers;
        tests[qIndex] = question;
        return { ...collection, tests };
      })
    );
  };

  const setCorrectIndex = (qIndex, aIndex) => {
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.name !== selected) return collection;
        const tests = [...collection.tests];
        tests[qIndex] = { ...tests[qIndex], correctIndex: aIndex };
        return { ...collection, tests };
      })
    );
  };

  const swipeRightStyle = {
    animation: "swipeLeft 0.4s forwards ease-out",
    pointerEvents: "none",
  };

  return (
    <div style={{ padding: "1rem" }}>
      <style>{`
        @keyframes swipeLeft {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-120%);
          }
        }
      `}</style>

      <h2>Навчання</h2>

      <label>Оберіть колекцію:</label>
      <select
        onChange={(e) => {
          setSelected(e.target.value);
          setShowAnswerIndexes([]);
          setEditIndex(null);
        }}
        value={selected}
      >
        <option value="">-- Виберіть --</option>
        {collections.map((col) => (
          <option key={col.name} value={col.name}>
            {col.name}
          </option>
        ))}
      </select>

      {selected && currentTests.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          {currentTests.map((q, i) => (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "1.5rem",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                marginBottom: "1.5rem",
                transition: "transform 0.4s, opacity 0.4s",
                ...(deletingIndex === i ? swipeRightStyle : {}),
              }}
              onAnimationEnd={() => {
                if (deletingIndex === i) {
                  deleteTest(selected, i);
                  setDeletingIndex(null);
                }
              }}
            >
              {editIndex === i ? (
                <>
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

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {q.answers.map((a, j) => (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          borderRadius: "6px",
                          padding: "0.9rem 1rem",
                          backgroundColor:
                            q.correctIndex === j ? "#d4edda" : "#f9f9f9",
                        }}
                      >
                        <input
                          type="radio"
                          name={`correct-${i}`}
                          checked={q.correctIndex === j}
                          onChange={() => setCorrectIndex(i, j)}
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
                        <MdDeleteOutline
                          style={{ cursor: "pointer", marginLeft: "0.75rem" }}
                          onClick={() => removeAnswerOption(i, j)}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addAnswerOption(i)}
                    style={{
                      display: "block",
                      width: "100%",
                      border: "1px dashed #aaa",
                      borderRadius: "6px",
                      padding: "0.5rem",
                      fontSize: "1rem",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#555",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>
                      +
                    </span>{" "}
                    Додати відповідь
                  </button>

                  <button
                    onClick={() => toggleEditIndex(i)}
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
                        justifyContent: "center",
                      }}
                    >
                      <HiCheck style={{ marginRight: "0.5rem" }} size={18} />
                      <span style={{ fontSize: "1rem", marginRight: "0.5rem" }}>
                      Застосувати зміни</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.45rem",
                      marginBottom: "1.2rem",
                    }}
                  >
                    <strong>
                      {q.number}. {q.question}
                    </strong>
                    <button
                      style={{
                        padding: "0.7rem 0.8rem",
                        borderRadius: "6px",
                        border: "1px solid #ffffff",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                      }}
                      onClick={() => setDeletingIndex(i)}
                    >
                      <MdDelete size="26px" color="grey" />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {q.answers.map((a, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor:
                            showAnswerIndexes.includes(i) &&
                            idx === q.correctIndex
                              ? "#d4edda"
                              : "#f0f0f0",
                          padding: "0.8rem",
                          borderRadius: "4px",
                        }}
                      >
                        <strong>{a.label}.</strong> {a.text}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
                  >
                    <button onClick={() => toggleEditIndex(i)} style={editBtn}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <HiPencil style={{ marginRight: "0.5rem" }} size={18} />
                        <span>Редагувати</span>
                      </div>
                    </button>

                    <button onClick={() => toggleShowAnswer(i)} style={editBtn}>
                      {showAnswerIndexes.includes(i) ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaEyeSlash
                            style={{ marginRight: "0.5rem" }}
                            size={18}
                          />
                          <span>Сховати відповідь</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaEye style={{ marginRight: "0.5rem" }} size={18} />
                          <span>Підглянути</span>
                        </div>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!selected && (
        <div style={{ marginTop: "1rem" }}>
          Виберіть колекцію для початку навчання.
        </div>
      )}
    </div>
  );
}
