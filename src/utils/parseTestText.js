export function parseTestText(text) {
  const questions = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let currentQuestion = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 🟡 Нове питання
    const matchQuestion = line.match(/^(\d+)[).]?\s*(.+)/);
    if (matchQuestion) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      currentQuestion = {
        number: matchQuestion[1],
        question: matchQuestion[2],
        answers: [],
        correctIndex: null,
      };
      continue;
    }

    // 🟢 Варіанти відповіді
    const matchAnswer = line.match(/^([A-E])[).]?\s*(.+)/);
    if (matchAnswer && currentQuestion) {
      currentQuestion.answers.push({
        label: matchAnswer[1],
        text: matchAnswer[2],
      });
    } else if (currentQuestion) {
      const lastAnswer = currentQuestion.answers.at(-1);

      if (lastAnswer) {
        // 🔵 Продовження відповіді
        lastAnswer.text += " " + line;
      } else {
        // 🔵 Продовження питання
        currentQuestion.question += " " + line;
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}