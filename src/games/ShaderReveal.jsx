
import { useShaderReveal } from "./useShaderReveal";

export default function ShaderReveal() {
  const game = useShaderReveal();

  if (game.loading) {
    return <p>Loading shaders...</p>;
  }

  if (game.error) {
    return (
      <main className="shader-reveal">
        <h2>Couldn't load shaders</h2>
        <p>{game.error}</p>
        <button onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  if (!game.shader) {
    return <p>No shader available.</p>;
  }

  const isPlaying = game.status === "playing";

  return (
    <main className="shader-reveal">
      {/* Game heading and score */}
      <header>
        <h1>Shader Reveal</h1>
        <p>Identify the shader from its icon.</p>

        <p>
          Round: {game.round} | Score: {game.score}
        </p>

        <p>
          Wrong guesses: {game.wrongGuesses}/{game.maxWrongGuesses}
        </p>
      </header>

      {/* Mystery shader image */}
      <section>
        <div className="reveal-image-container">
          <img
            className="reveal-image"
            src={game.shader.icon}
            alt={isPlaying ? "Mystery shader" : game.shader.name}
            style={{
              filter: `blur(${isPlaying ? game.blurAmount : 0}px)`,
            }}
          />
        </div>

        {/* Guess form */}
        {isPlaying && (
          <>
            <form
              onSubmit={game.submitGuess}
              className="reveal-guess-form"
            >
              <label htmlFor="shader-guess">Shader name</label>

              <input
                id="shader-guess"
                type="text"
                value={game.guess}
                onChange={(event) => game.setGuess(event.target.value)}
                placeholder="Enter your guess..."
                autoComplete="off"
              />

              <button type="submit" disabled={!game.guess.trim()}>
                Guess
              </button>
            </form>

            <button onClick={game.revealAnswer}>
              Reveal Answer
            </button>
          </>
        )}

        {/* Feedback and next round */}
        {!isPlaying && (
          <button onClick={game.nextRound}>
            Next Shader
          </button>
        )}

        {game.feedback && (
          <p className="reveal-feedback" aria-live="polite">
            {game.feedback}
          </p>
        )}
      </section>
    </main>
  );
}
