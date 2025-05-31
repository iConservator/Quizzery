export function parseTestText(text) {
  const questions = [];
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

  let currentQuestion = null;
  let waitingForAnswers = false;  // Чи чекаємо на рядки з варіантами відповідей після "A. B. C. D. E."
  
  const flushQuestion = () => {
    if (currentQuestion) {
      questions.push(currentQuestion);
      currentQuestion = null;
      waitingForAnswers = false;
    }
  };

  const answerLettersPattern = /^(?:[A-E]\.\s*){2,5}/i;
  const answerLabels = ["A", "B", "C", "D", "E"];

  // Оновлена функція розбиття рядка з кількома відповідями, доповнює порожні відповіді наступним рядком
  function splitAnswersInLine(line, nextLinesIterator) {
    const regex = /([A-E])[).]\s*/g;
    const answers = [];
    let match;
    let lastIndex = 0;

    // Знаходимо усі позначки відповіді (A., B. і т.п.)
    const positions = [];
    while ((match = regex.exec(line)) !== null) {
      positions.push({ label: match[1], index: match.index });
    }
    positions.push({ index: line.length }); // для кінця останнього тексту

    // Вирізаємо текст між відповідями
    for (let i = 0; i < positions.length - 1; i++) {
      const label = positions[i].label;
      const start = positions[i].index + 2; // після "A." або "B."
      const end = positions[i + 1].index;
      let text = line.slice(start, end).trim();

      // Якщо текст відповіді порожній — беремо наступний рядок з ітератора (якщо є)
      if (!text && nextLinesIterator) {
        const nextLine = nextLinesIterator();
        if (nextLine) {
          text = nextLine.trim();
        }
      }

      answers.push({ label, text });
    }
    return answers;
  }

  // Ітератор для читання наступних рядків
  function makeLineIterator(lines, startIndex) {
    let idx = startIndex;
    return () => {
      if (idx < lines.length) {
        return lines[idx++];
      }
      return null;
    };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const matchQuestion = line.match(/^(\d+)[).]?\s*(.+)$/);
    if (matchQuestion) {
      flushQuestion();

      let rawText = matchQuestion[2];

      if (answerLettersPattern.test(rawText)) {
        rawText = rawText.replace(answerLettersPattern, "").trim();

        currentQuestion = {
          number: matchQuestion[1],
          question: rawText,
          answers: [],
          correctIndex: null,
        };

        waitingForAnswers = true;
        continue;
      } else {
        currentQuestion = {
          number: matchQuestion[1],
          question: rawText,
          answers: [],
          correctIndex: null,
        };
        waitingForAnswers = false;
        continue;
      }
    }

    if (waitingForAnswers && currentQuestion) {
      const label = answerLabels[currentQuestion.answers.length];
      if (label) {
        currentQuestion.answers.push({
          label,
          text: line,
        });
      } else {
        currentQuestion.answers.push({
          label: "?",
          text: line,
        });
      }
      continue;
    }

    const matchAnswer = line.match(/^([A-E])[).]?\s*(.+)$/i);
    if (matchAnswer && currentQuestion) {
      // Використовуємо ітератор для наступних рядків після поточного (i+1)
      const nextLinesIterator = makeLineIterator(lines, i + 1);
      const splitted = splitAnswersInLine(line, () => {
        // отримуємо наступний рядок через ітератор
        const nextLine = nextLinesIterator();
        // Оскільки ми споживаємо рядки додатково, індекс циклу потрібно синхронізувати
        if (nextLine !== null) {
          i++; // рухаємо основний лічильник, бо наступний рядок використано тут
        }
        return nextLine;
      });

      if (splitted.length > 1) {
        for (const ans of splitted) {
          currentQuestion.answers.push({
            label: ans.label,
            text: ans.text,
          });
        }
        waitingForAnswers = false;
        continue;
      } else {
        currentQuestion.answers.push({
          label: matchAnswer[1].toUpperCase(),
          text: matchAnswer[2],
        });
        waitingForAnswers = false;
        continue;
      }
    }

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