import { useState, useEffect, useRef } from "react";
import { useTestContext } from "../context/TestContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Test({ collectionName }) {
  const navigate = useNavigate();

  const { collections, getSession, startSession, updateSession, clearSession } =
    useTestContext();
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

  // Вибрана категорія (з location.state)
  const [selected] = useState(location.state?.selectedCategory || "");

  // Ініціалізація сесії або завантаження існуючої

  // Таймер
  // Ініціалізація сесії або завантаження існуючої

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
    if (!selected || collections.length === 0) return;

    const collection = collections.find((c) => c.name === selected);
    if (!collection) return;

    const session = getSession(selected);

    if (session) {
      setShuffledTests(session.shuffledTests);
      setCurrentIndex(session.currentIndex);
      setScore(session.score);
      setElapsedTime(0);
      setFinished(
        session.finished ?? session.currentIndex >= session.shuffledTests.length
      );
    } else {
      const shuffled = [...collection.tests].sort(() => Math.random() - 0.5);
      startSession(selected, shuffled); // Зберігаємо одразу перемішані тести
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

  // Оновлення сесії у localStorage при зміні важливих параметрів
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

  const resetTest = () => {
    if (!selected) return;

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

    // Передаємо перемішаний масив у старт сесії
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
          setChosen(null);
          setStatus(null);
          setAnimationKey((prev) => prev + 1);
          clearSession(selected); // видаляємо сесію тут, після завершення
        }
      }, 1000);
    } else {
      setStatus("wrong");
      setChosen(idx);
      setAnimationKey((prev) => prev + 1);
    }
  };

  const getButtonStyle = (idx) => {
    const correct = shuffledTests[currentIndex]?.correctIndex;

    if (finished && showCorrectAnswers) {
      return idx === correct
        ? { ...baseBtn, backgroundColor: "#d4edda", borderColor: "#28a745" }
        : baseBtn;
    }

    if (chosen === null) return baseBtn;

    if (idx === chosen && status === "wrong") {
      return { ...baseBtn, backgroundColor: "#f8d7da", borderColor: "#dc3545" };
    }

    if (idx === chosen && status === "correct") {
      return { ...baseBtn, backgroundColor: "#d4edda", borderColor: "#28a745" };
    }

    return baseBtn;
  };

  const progressPercent = shuffledTests.length
    ? finished
      ? 100
      : (currentIndex / shuffledTests.length) * 100
    : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!selected) return <p>Колекція не обрана</p>;

  if (!collections.find((c) => c.name === selected))
    return <p>Колекція не знайдена</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>🧪 Тестування</h2>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }}>
          {formatTime(elapsedTime)}
        </div>
      </div>

      <div style={progressContainer}>
        <div style={{ ...progressBar, width: `${progressPercent}%` }} />
      </div>

      {!finished && shuffledTests.length > 0 && (
        <div
          key={animationKey}
          style={{
            ...cardStyle,
            animation:
              status === "wrong"
                ? "shake 0.4s"
                : status === "correct"
                ? "pulse 0.6s"
                : "fadeIn 0.4s",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "1rem" }}>
            {shuffledTests[currentIndex].number}.{" "}
            {shuffledTests[currentIndex].question}
          </div>

          {shuffledTests[currentIndex].answers.map((a, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              style={getButtonStyle(idx)}
              disabled={chosen !== null && status === "correct"}
            >
              <strong>{a.label}.</strong> {a.text}
            </button>
          ))}

          <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
            Прогрес: {currentIndex + 1} / {shuffledTests.length}
          </div>
        </div>
      )}

      {finished && (
        <div>
          <h3>✅ Завершено</h3>
          <p>
            Результат: {score} з {shuffledTests.length}
          </p>

          {!showCorrectAnswers && (
            <button
              onClick={() => setShowCorrectAnswers(true)}
              style={{ marginRight: "1rem" }}
            >
              Переглянути правильні відповіді
            </button>
          )}
          <button onClick={resetTest}>Пройти ще раз</button>

          {showCorrectAnswers && (
            <div style={{ marginTop: "2rem" }}>
              <h4>Правильні відповіді:</h4>
              {shuffledTests.map((test, idx) => (
                <div key={idx} style={{ marginBottom: "1rem" }}>
                  <div>
                    <strong>{test.number}.</strong> {test.question}
                  </div>
                  <div style={{ marginLeft: "1rem", color: "#28a745" }}>
                    ✅ {test.answers[test.correctIndex].label}.{" "}
                    {test.answers[test.correctIndex].text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          padding: "0.7rem 1rem",
          marginBottom: "0.5rem",
          color: "white",
          marginTop: "1.2rem",
          fontSize: "1rem",
          borderRadius: "6px",
          borderColor: "#dc3545",
          border: "1px solid #8D909B",
          cursor: "pointer",
          backgroundColor: "#8D909B",
          transition: "background-color 0.3s, border-color 0.3s",
          opacity: 0,
          animation: "fadeIn 0.4s ease-in-out forwards",
        }}
        disabled={finished}
        onClick={() => {
          clearSession(selected);
          navigate("/");
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>{finished ? "Сесію завершено" : "Завершити сесію"}</span>
        </div>
      </button>
    </div>
  );
}

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
  transition: "background-color 0.3s, border-color 0.3s",
};

const progressContainer = {
  position: "relative",
  height: "25px",
  backgroundColor: "#e9ecef",
  borderRadius: "12px",
  marginBottom: "1rem",
  overflow: "hidden",
};

const progressBar = {
  height: "100%",
  backgroundColor: "#007bff",
  transition: "width 0.4s ease",
};
