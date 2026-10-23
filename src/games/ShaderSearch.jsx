
import { useShaderSearch } from "./useShaderSearch";

export default function ShaderSearch() {
  const game = useShaderSearch();

  if (game.loading) {
    return <p>Loading shaders...</p>;
  }

  if (game.error) {
    return (
      <main className="shader-search">
        <h2>Couldn't load shaders</h2>
        <p>{game.error}</p>
        <button onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  if (!game.question) {
    return <p>No question available.</p>;
  }

  const { answer, choices } = game.question;

  return (
    <main className="shader-search">
      {/* Game heading and score */}
      <header>
        <h1>Shader Search</h1>
        <p>Find the shader that matches the name.</p>

        <p>
          Round: {game.round} | Score: {game.score}
        </p>
      </header>

      {/* Question */}
      <section>
        <h2>{answer.name}</h2>
        <p>Which icon belongs to this shader?</p>

        {/* Answer choices */}
        <div className="shader-choices">
          {choices.map((shader) => {
            const isCorrect = shader.id === answer.id;
            const isSelected = game.selectedId === shader.id;

            let className = "shader-choice";

            if (game.selectedId !== null && isCorrect) {
              className += " correct";
            } else if (isSelected && !isCorrect) {
              className += " incorrect";
            }

            return (
                <button
                    key={shader.id}
                    className={className}
                    onClick={() => game.chooseAnswer(shader)}
                    disabled={game.selectedId !== null}
                >
                    <img src={shader.icon} alt=""/>

                    {game.selectedId !== null && (
                        <span className={"shader_name"}>{shader.name}</span>
                    )}
                </button>
            );
          })}
        </div>

          {/* Feedback after answering */}
          {game.selectedId !== null && (
              <div className="shader-feedback" aria-live="polite">
                  <h3>
                      {game.answeredCorrectly ? "Correct!" : "Not quite!"}
                  </h3>

                  {!game.answeredCorrectly && (
              <p>The correct answer was {answer.name}.</p>
            )}

                  <button
                      onClick={game.nextQuestion}
                      disabled={game.creatingQuestion}
                  >
                      {game.creatingQuestion ? "Finding similar shaders..." : "Next Shader"}
                  </button>
              </div>
          )}
      </section>
    </main>
  );
}
