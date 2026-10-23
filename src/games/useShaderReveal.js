
import { useEffect, useState } from "react";
import { getShaders } from "../services/bungieApi";

const MAX_WRONG_GUESSES = 5;

function pickShader(shaders, previousId = null) {
  const pool = shaders.filter((shader) => shader.id !== previousId);
  const available = pool.length > 0 ? pool : shaders;

  return available[Math.floor(Math.random() * available.length)];
}

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function useShaderReveal() {
  const [shaders, setShaders] = useState([]);
  const [shader, setShader] = useState(null);
  const [guess, setGuess] = useState("");
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [status, setStatus] = useState("playing");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getShaders()
      .then((data) => {
        setShaders(data);
        setShader(pickShader(data));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function submitGuess(event) {
    event.preventDefault();

    if (!shader || status !== "playing" || !guess.trim()) {
      return;
    }

    if (normalizeName(guess) === normalizeName(shader.name)) {
      setScore((current) => current + 1);
      setStatus("correct");
      setFeedback(`Correct! The shader was ${shader.name}.`);
      return;
    }

    const nextWrongCount = wrongGuesses + 1;
    setWrongGuesses(nextWrongCount);
    setGuess("");

    if (nextWrongCount >= MAX_WRONG_GUESSES) {
      setStatus("revealed");
      setFeedback(`Out of guesses! The shader was ${shader.name}.`);
    } else {
      setFeedback("Not quite! The image has become clearer.");
    }
  }

  function revealAnswer() {
    if (status !== "playing" || !shader) return;

    setStatus("revealed");
    setFeedback(`The shader was ${shader.name}.`);
  }

  function nextRound() {
    if (shaders.length === 0) return;

    setShader(pickShader(shaders, shader?.id));
    setGuess("");
    setWrongGuesses(0);
    setStatus("playing");
    setFeedback("");
    setRound((current) => current + 1);
  }

  const blurAmount = Math.max(0, 20 - wrongGuesses * 4);

  return {
    shader,
    guess,
    setGuess,
    wrongGuesses,
    maxWrongGuesses: MAX_WRONG_GUESSES,
    score,
    round,
    status,
    feedback,
    loading,
    error,
    blurAmount,
    submitGuess,
    revealAnswer,
    nextRound,
  };
}
