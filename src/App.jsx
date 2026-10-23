
import { useState } from "react";
import ShaderSearch from "./games/ShaderSearch";
import ShaderReveal from "./games/ShaderReveal";
import "./App.css";

function App() {
  const [game, setGame] = useState("search");

  return (
    <div>
      <nav className="game-menu">
        <button
          onClick={() => setGame("search")}
          disabled={game === "search"}
        >
          Shader Search
        </button>

        <button
          onClick={() => setGame("reveal")}
          disabled={game === "reveal"}
        >
          Shader Reveal
        </button>
      </nav>

      {game === "search" ? <ShaderSearch /> : <ShaderReveal />}
    </div>
  );
}

export default App;
