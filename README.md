# Guess the Shader

A web-based guessing game for **Destiny 2** where players test their knowledge of the game's shaders.

## Features

- **Shader Search:** Guess a shader by name using its icon as a clue.
- **Shader Reveal:** Identify a shader from a blurred image that gradually reveals more detail after incorrect guesses.
- **Destiny 2 Integration:** Retrieves shader information and icons using the Bungie API.
- **Multiple Game Modes:** Switch between different shader guessing challenges.

## Requirements

- [Node.js](https://nodejs.org/)
- A [Bungie.net API key](https://www.bungie.net/en/Application)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/HaloMan3096/guess_the_shader.git
   cd guess_the_shader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and add your Bungie API key:
   ```dotenv
   VITE_BUNGIE_API_KEY=your_bungie_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the local URL displayed in the terminal.

## Security

**Do not commit your `.env.local` file or publish your personal API key.** Vite exposes variables prefixed with `VITE_` to browser-side code, so this key is not truly secret when used directly by the frontend.

## Built With

- React
- Vite
- JavaScript
- Bungie API

