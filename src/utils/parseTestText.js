export function parseTestText(text) {
  const questions = [];
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

  let currentQuestion = null;
  let waitingForAnswers = false;

  const flushQuestion = () => {
    if (currentQuestion) {
      questions.push(currentQuestion);
      currentQuestion = null;
      waitingForAnswers = false;
    }
  };

  const answerLettersPattern = /^(?:[A-E]\.\s*){2,5}/i;
  const answerLabels = ["A", "B", "C", "D", "E"];

  // =========================
  // ⭐ НОРМАЛІЗАЦІЯ ВІДПОВІДІ
  // =========================
  function normalizeAnswer(rawText) {
    let text = rawText.trim();
    let isCorrect = false;

    // *A. Відповідь
    if (/^\*[A-E][).]/i.test(text)) {
      isCorrect = true;
      text = text.replace(/^\*[A-E][).]\s*/i, "");
    }

    // A. *Відповідь
    if (/^\*/.test(text)) {
      isCorrect = true;
      text = text.replace(/^\*\s*/, "");
    }

    return { text, isCorrect };
  }

  // ============================================
  // РОЗБИТТЯ РЯДКА З КІЛЬКОМА ВАРІАНТАМИ
  // ============================================
  function splitAnswersInLine(line, nextLinesIterator) {
    const regex = /(\*?[A-E])[).]\s*/g;
    const answers = [];
    let match;

    const positions = [];
    while ((match = regex.exec(line)) !== null) {
      positions.push({
        label: match[1].replace("*", "").toUpperCase(),
        hasStar: match[1].startsWith("*"),
        index: match.index
      });
    }
    positions.push({ index: line.length });

    for (let i = 0; i < positions.length - 1; i++) {
      const { label, hasStar, index } = positions[i];
      const start = index + 2;
      const end = positions[i + 1].index;

      let text = line.slice(start, end).trim();
      let isCorrect = hasStar;

      if (!text && nextLinesIterator) {
        const nextLine = nextLinesIterator();
        if (nextLine) text = nextLine.trim();
      }

      if (text.startsWith("*")) {
        isCorrect = true;
        text = text.replace(/^\*\s*/, "");
      }

      answers.push({ label, text, isCorrect });
    }

    return answers;
  }

  function makeLineIterator(lines, startIndex) {
    let idx = startIndex;
    return () => (idx < lines.length ? lines[idx++] : null);
  }

  // =========================
  // ОСНОВНИЙ ПАРСИНГ
  // =========================
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const matchQuestion = line.match(/^(\d+)[).]?\s*(.+)$/);
    if (matchQuestion) {
      flushQuestion();

      let rawText = matchQuestion[2];

      currentQuestion = {
        number: matchQuestion[1],
        question: rawText,
        answers: [],
        correctIndex: null
      };

      if (answerLettersPattern.test(rawText)) {
        currentQuestion.question = rawText.replace(answerLettersPattern, "").trim();
        waitingForAnswers = true;
      } else {
        waitingForAnswers = false;
      }
      continue;
    }

    // Відповіді без A./B./C. (по рядках)
    if (waitingForAnswers && currentQuestion) {
      const label = answerLabels[currentQuestion.answers.length] ?? "?";
      const normalized = normalizeAnswer(line);

      currentQuestion.answers.push({
        label,
        text: normalized.text
      });

      if (normalized.isCorrect) {
        currentQuestion.correctIndex = currentQuestion.answers.length - 1;
      }
      continue;
    }

    // Відповіді з A./B./C.
    const matchAnswer = line.match(/^(\*?[A-E])[).]?\s*(.+)$/i);
    if (matchAnswer && currentQuestion) {
      const nextLinesIterator = makeLineIterator(lines, i + 1);
      const splitted = splitAnswersInLine(line, () => {
        const nextLine = nextLinesIterator();
        if (nextLine !== null) i++;
        return nextLine;
      });

      if (splitted.length > 1) {
        for (const ans of splitted) {
          currentQuestion.answers.push({
            label: ans.label,
            text: ans.text
          });

          if (ans.isCorrect) {
            currentQuestion.correctIndex = currentQuestion.answers.length - 1;
          }
        }
        waitingForAnswers = false;
        continue;
      }

      const normalized = normalizeAnswer(matchAnswer[2]);

      currentQuestion.answers.push({
        label: matchAnswer[1].replace("*", "").toUpperCase(),
        text: normalized.text
      });

      if (normalized.isCorrect || matchAnswer[1].startsWith("*")) {
        currentQuestion.correctIndex = currentQuestion.answers.length - 1;
      }

      waitingForAnswers = false;
      continue;
    }

    // Продовження тексту
    if (currentQuestion) {
      const lastAnswer = currentQuestion.answers.at(-1);
      if (lastAnswer) {
        lastAnswer.text += " " + line;
      } else {
        currentQuestion.question += " " + line;
      }
    }
  }

  flushQuestion();
  return questions;
}
