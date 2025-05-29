export function parseTestText(text) {
    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
    let currentQuestion = null;
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
  
      // 🟡 Виявлення нового питання
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
  
      // 🟢 Виявлення варіантів відповіді A–E
      const matchAnswer = line.match(/^([A-E])[).]?\s*(.+)/);
      if (matchAnswer && currentQuestion) {
        currentQuestion.answers.push({
          label: matchAnswer[1],
          text: matchAnswer[2],
        });
      } else if (currentQuestion) {
        // 🔵 Якщо це продовження попередньої відповіді (наступний рядок)
        const lastAnswer = currentQuestion.answers.at(-1);
        if (lastAnswer) {
          lastAnswer.text += ' ' + line;
        }
      }
    }
  
    // Додаємо останнє питання
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
  
    return questions;
  }