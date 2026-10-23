
import { useEffect, useState } from "react";
import { getShaders } from "../services/bungieApi";
import { rankSimilarShaders } from "../services/shaderSimilarity";

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getWords(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function getNameSimilarity(nameA, nameB) {
  const wordsA = getWords(nameA);
  const wordsB = getWords(nameB);

  const sharedWords = wordsA.filter((word) =>
    wordsB.includes(word)
  ).length;

  const a = wordsA.join(" ");
  const b = wordsB.join(" ");

  let prefix = 0;

  while (
    prefix < a.length &&
    prefix < b.length &&
    a[prefix] === b[prefix]
  ) {
    prefix++;
  }

  return sharedWords * 2 +
    prefix / Math.max(a.length, b.length, 1);
}

async function createQuestion(shaders, previousId = null) {
  if (shaders.length < 4) {
    throw new Error("At least four shaders are needed to play.");
  }

  const pool = shaders.filter(
    (shader) => shader.id !== previousId
  );

  const answerPool = pool.length ? pool : shaders;
  const answer =
    answerPool[Math.floor(Math.random() * answerPool.length)];

  // Analyze a random subset instead of downloading/analyzing
  // every shader icon at once.
  let ranked = await rankSimilarShaders(answer, shaders);

  const candidates = ranked
  ? ranked.slice(0, Math.min(10, ranked.length))
  : shuffle(
      shaders.filter((shader) => shader.id !== answer.id)
    ).slice(0, 10);

  if (!ranked || ranked.length < 3) {
    // Fallback when icon analysis fails due to CORS or
    // unavailable images.
    ranked = [...candidates].sort(
      (a, b) =>
        getNameSimilarity(b.name, answer.name) -
        getNameSimilarity(a.name, answer.name)
    );
  }

  // Select randomly from the best few matches to keep rounds varied.
  const bestMatches = ranked.slice(0, Math.min(10, ranked.length));
  const wrongAnswers = shuffle(bestMatches).slice(0, 3);

  // If some images couldn't be analyzed, fill any missing slots.
  if (wrongAnswers.length < 3) {
    const usedIds = new Set([
      answer.id,
      ...wrongAnswers.map((shader) => shader.id),
    ]);

    wrongAnswers.push(
      ...shuffle(
        shaders.filter((shader) => !usedIds.has(shader.id))
      ).slice(0, 3 - wrongAnswers.length)
    );
  }

  return {
    answer,
    choices: shuffle([answer, ...wrongAnswers]),
  };
}

export function useShaderSearch() {
  const [shaders, setShaders] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadGame() {
      try {
        const data = await getShaders();
        if (cancelled) return;

        setShaders(data);

        const firstQuestion = await createQuestion(data);
        if (!cancelled) {
          setQuestion(firstQuestion);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGame();

    return () => {
      cancelled = true;
    };
  }, []);

  function chooseAnswer(shader) {
    if (selectedId !== null || !question) return;

    setSelectedId(shader.id);

    if (shader.id === question.answer.id) {
      setScore((current) => current + 1);
    }
  }

  async function nextQuestion() {
    if (!question || creatingQuestion) return;

    setCreatingQuestion(true);

    try {
      const next = await createQuestion(shaders, question.answer.id);
      setQuestion(next);
      setSelectedId(null);
      setRound((current) => current + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingQuestion(false);
    }
  }

  const answeredCorrectly =
    question !== null && selectedId === question.answer.id;

  return {
    question,
    selectedId,
    score,
    round,
    loading,
    error,
    creatingQuestion,
    answeredCorrectly,
    chooseAnswer,
    nextQuestion,
  };
}
