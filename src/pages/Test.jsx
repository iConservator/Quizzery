import { useState, useEffect, useRef } from "react";
import { useTestContext } from "../context/TestContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Test({ collectionName }) {
  const navigate = useNavigate();

  const {
    collections,
    getSession,
    startSession,
    updateSession,
    clearSession,
    addCollection,
    addTestsToCollection,
  } = useTestContext();

  const [shuffledTests, setShuffledTests] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [status, setStatus] = useState(null); // 'correct', 'wrong'
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const timerId = useRef(null);
  const location = useLocation();

  const [selected] = useState(location.state?.selectedCategory || "");

  /* ================== HELPERS ================== */

  const addToUnclear = (test) => {
    const unclear = collections.find((c) => c.name === "незрозумілі");

    if (!unclear) {
      addCollection("незрозумілі");
      addTestsToCollection("незрозумілі", [test]);
      return;
    }

    const exists = unclear.tests.some(
      (t) => t.number === test.number && t.question === test.question
    );

    if (!exists) {
      addTestsToCollection("незрозумілі", [test]);
    }
  };

  /* ================== EFFECTS ================== */

  useEffect(() => {
    if (!selected || collections.length === 0) return;

    const collection = collections.find((c) => c.name === selected);
    if (!collection) return;

    const session = getSession(selected);

    if (session) {
      setShuffledTests(session.shuffledTests);
      setCurrentIndex(session.currentIndex);
      setScore(session.score);
      setElapsedTime(session.elapsedTime || 0);
      setFinished(
        session.finished ?? session.currentIndex >= session.shuffledTests.length
      );
    } else {
      const shuffled = [...collection.tests].sort(() => Math.random() - 0.5);
      startSession(selected, shuffled);
      setShuffledTests(shuffled);
      setCurrentIndex(0);
      setScore(0);
      setElapsedTime(0);
      setFinished(false);
    }

    setChosen(null);
    setStatus(null);
    setShowCorrectAnswers(false);
    setAnimationKey((prev) => prev + 1);
  }, [selected, collections.length]);

  useEffect(() => {
    if (!selected || shuffledTests.length === 0) return;

    updateSession(selected, {
      shuffledTests,
      currentIndex,
      score,
    });
  }, [selected, shuffledTests, currentIndex, score, updateSession]);

  useEffect(() => {
    if (finished || shuffledTests.length === 0) return;

    timerId.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerId.current);
  }, [finished, shuffledTests.length]);

  /* ================== ACTIONS ================== */

  const resetTest = () => {
    const collection = collections.find((c) => c.name === selected);
    if (!collection) return;

    const shuffled = [...collection.tests].sort(() => Math.random() - 0.5);

    setShuffledTests(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setChosen(null);
    setStatus(null);
    setShowCorrectAnswers(false);
    setElapsedTime(0);
    setAnimationKey((prev) => prev + 1);

    startSession(selected, shuffled);
  };

  const handleClick = (idx) => {
    if (chosen !== null && status === "correct") return;

    const correct = shuffledTests[currentIndex].correctIndex;
    const next = currentIndex + 1;

    if (idx === correct) {
      setStatus("correct");
      setScore((prev) => prev + 1);
      setChosen(idx);
      setAnimationKey((prev) => prev + 1);

      setTimeout(() => {
        if (next < shuffledTests.length) {
          setCurrentIndex(next);
          setChosen(null);
          setStatus(null);
          setAnimationKey((prev) => prev + 1);
        } else {
          setFinished(true);
          clearSession(selected);
        }
      }, 1000);
    } else {
      setStatus("wrong");
      setChosen(idx);
      setAnimationKey((prev) => prev + 1);

      setTimeout(() => {
        if (
          window.confirm(
            "❌ Неправильно. Додати це питання в «незрозумілі»?"
          )
        ) {
          addToUnclear(shuffledTests[currentIndex]);
        }
      }, 300);
    }
  };

  /* ================== RENDER ================== */

  if (!selected) return <p>Колекція не обрана</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2>🧪 Тестування</h2>

      {!finished && shuffledTests.length > 0 && (
        <div key={animationKey} style={cardStyle}>
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {shuffledTests[currentIndex].number}.{" "}
              {shuffledTests[currentIndex].question}
            </span>

            <button
              onClick={() => addToUnclear(shuffledTests[currentIndex])}
              title="Додати в незрозумілі"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ⭐
            </button>
          </div>

          {shuffledTests[currentIndex].answers.map((a, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              style={baseBtn}
            >
              <strong>{a.label}.</strong> {a.text}
            </button>
          ))}
        </div>
      )}

      <button
        style={baseBtn}
        onClick={() => {
          clearSession(selected);
          navigate("/");
        }}
      >
        Завершити сесію
      </button>
    </div>
  );
}

/* ================== STYLES (НЕ ЗМІНЮВАЛИСЬ) ================== */

const cardStyle = {
  background: "white",
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "1.5rem",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  marginTop: "2rem",
};

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
};