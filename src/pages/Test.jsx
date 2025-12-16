import { useState, useEffect, useRef } from "react";
import { useTestContext } from "../context/TestContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

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

  // ===============================
  // ⭐ ДОДАТИ В "НЕЗРОЗУМІЛІ"
  // ===============================
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

  // ===============================
  // ІНІЦІАЛІЗАЦІЯ СЕСІЇ
  // ===============================
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

  // ===============================
  // ОНОВЛЕННЯ СЕСІЇ
  // ===============================
  useEffect(() => {
    if (!selected || shuffledTests.length === 0) return;

    updateSession(selected, {
      shuffledTests,
      currentIndex,
      score,
    });
  }, [selected, shuffledTests, currentIndex, score, updateSession]);

  // ===============================
  // ТАЙМЕР
  // ===============================
  useEffect(() => {
    if (finished || shuffledTests.length === 0) return;

    timerId.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerId.current);
  }, [finished, shuffledTests.length]);

  const handleClick = (idx) => {
    if (chosen !== null && status === "correct") return;

    const currentTest = shuffledTests[currentIndex];
    const correct = currentTest.correctIndex;
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
        } else {
          setFinished(true);
          clearSession(selected);
        }
      }, 1000);
    } else {
      setStatus("wrong");
      setChosen(idx);
      setAnimationKey((prev) => prev + 1);

      // 🤔 АВТОПРОПОЗИЦІЯ
      setTimeout(() => {
        const confirmAdd = window.confirm(
          "❌ Неправильна відповідь\nДодати це питання в «незрозумілі»?"
        );
        if (confirmAdd) addToUnclear(currentTest);
      }, 300);
    }
  };

  const getButtonStyle = (idx) => {
    const correct = shuffledTests[currentIndex]?.correctIndex;

    if (chosen === null) return baseBtn;

    if (idx === chosen && status === "wrong") {
      return { ...baseBtn, backgroundColor: "#f8d7da" };
    }

    if (idx === chosen && status === "correct") {
      return { ...baseBtn, backgroundColor: "#d4edda" };
    }

    return baseBtn;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!selected) return <p>Колекція не обрана</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2>🧪 Тестування</h2>
      <div>{formatTime(elapsedTime)}</div>

      {!finished && shuffledTests.length > 0 && (
        <div key={animationKey} style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>
              {shuffledTests[currentIndex].number}.{" "}
              {shuffledTests[currentIndex].question}
            </strong>

            <button
              title="Додати в незрозумілі"
              onClick={() => addToUnclear(shuffledTests[currentIndex])}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <FaStar color="#f4c430" size={22} />
            </button>
          </div>

          {shuffledTests[currentIndex].answers.map((a, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              style={getButtonStyle(idx)}
            >
              <strong>{a.label}.</strong> {a.text}
            </button>
          ))}
        </div>
      )}

      {finished && (
        <div>
          <h3>✅ Завершено</h3>
          <p>
            Результат: {score} з {shuffledTests.length}
          </p>
        </div>
      )}

      <button
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

const cardStyle = {
  background: "white",
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "1.5rem",
  marginTop: "1rem",
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
