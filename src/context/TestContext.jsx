import { createContext, useState, useContext } from 'react';

const TestContext = createContext();

export function TestProvider({ children }) {
  const [collections, setCollections] = useState({});

  const addCollection = (name) => {
    setCollections(prev => prev[name] ? prev : { ...prev, [name]: [] });
  };

  const addTestsToCollection = (name, tests) => {
    setCollections(prev => ({
      ...prev,
      [name]: [...(prev[name] || []), ...tests],
    }));
  };

  const setCorrectAnswer = (collectionName, questionIndex, answerIndex) => {
    const updated = { ...collections };
    if (updated[collectionName] && updated[collectionName][questionIndex]) {
      updated[collectionName][questionIndex].correctIndex = answerIndex;
      setCollections(updated);
    }
  };

  return (
    <TestContext.Provider value={{
      collections,
      addCollection,
      addTestsToCollection,
      setCorrectAnswer,
    }}>
      {children}
    </TestContext.Provider>
  );
}

export function useTestContext() {
  return useContext(TestContext);
}