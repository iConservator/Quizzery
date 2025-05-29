import { createContext, useState, useContext, useEffect } from 'react';

const TestContext = createContext();

export function TestProvider({ children }) {
  const [collections, setCollections] = useState(() => {
    try {
      const saved = localStorage.getItem('collections');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Ошибка при чтении collections из localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(collections));
  }, [collections]);

  const deleteTest = (collectionName, testIndex) => {
    setCollections(prev =>
      prev.map(c => {
        if (c.name !== collectionName) return c;
        const updatedTests = c.tests.filter((_, i) => i !== testIndex);
        return { ...c, tests: updatedTests };
      })
    );
  };

  const deleteCollection = (name) => {
    setCollections((prev) => prev.filter((col) => col.name !== name));
    // Можна ще очищати sessionStorage, якщо є сесія для цієї колекції
    sessionStorage.removeItem(`session-${name}`);
  };

  // ✅ Добавить коллекцию
  const addCollection = (name) => {
    setCollections(prev => (
      prev.some(c => c.name === name) ? prev : [...prev, { name, tests: [] }]
    ));
  };

  // ✅ Добавить тесты в коллекцию
  const addTestsToCollection = (name, tests) => {
    setCollections(prev =>
      prev.map(c =>
        c.name === name
          ? { ...c, tests: [...c.tests, ...tests] }
          : c
      )
    );
  };

  // ✅ Установить правильный ответ
  const setCorrectAnswer = (collectionName, questionIndex, answerIndex) => {
    setCollections(prev =>
      prev.map(c => {
        if (c.name !== collectionName) return c;
        const updatedTests = [...c.tests];
        if (updatedTests[questionIndex]) {
          updatedTests[questionIndex] = {
            ...updatedTests[questionIndex],
            correctIndex: answerIndex
          };
        }
        return { ...c, tests: updatedTests };
      })
    );
  };

  return (
    <TestContext.Provider value={{
      collections,
      setCollections,
      addCollection,
      addTestsToCollection,
      setCorrectAnswer,
      deleteTest,
      deleteCollection,
    }}>
      {children}
    </TestContext.Provider>
  );
}

export function useTestContext() {
  return useContext(TestContext);
}