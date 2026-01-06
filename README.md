<div align="center">
  
# 🎮 Champion’s Gambit

**Champion’s Gambit** is a polished, Pokémon-themed chess game built with React and TypeScript.  
It combines the deterministic strategy of classic chess with a Red vs Blue rivalry, custom AI opponents, and a carefully crafted game presentation.

</div>

<br />

## 🏗️ Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="160">
        <br/>
        <b>React 18</b> ⚛️<br/>
        <sub>UI Framework</sub>
        <br/><br/>
      </td>
      <td align="center" width="160">
        <br/>
        <b>TypeScript</b> 🟡<br/>
        <sub>Language</sub>
        <br/><br/>
      </td>
      <td align="center" width="160">
        <br/>
        <b>Vite</b> ⚡<br/>
        <sub>Build Tool</sub>
        <br/><br/>
      </td>
      <td align="center" width="160">
        <br/>
        <b>chess.js</b> ♟️<br/>
        <sub>Game Logic</sub>
        <br/><br/>
      </td>
      <td align="center" width="160">
        <br/>
        <b>Stockfish</b> 🤖<br/>
        <sub>AI Engine (WASM)</sub>
        <br/><br/>
      </td>
    </tr>
  </table>
</div>

<br />

## 🎯 Game Overview

- Standard chess rules are followed exactly.
- **Red always represents the White pieces**, and **Blue represents the Black pieces**.
- Pokémon are used purely as **visual representations** for chess pieces.
- No Pokémon battle mechanics or rule modifications are introduced.

---

## 🕹️ Game Modes

### 🧑‍🤝‍🧑 Pass & Play
- Local two-player chess.
- Red (White) vs Blue (Black).
- Uses the canonical Red and Blue Pokémon lineups.

### 🤖 Vs Computer
- Face a progression of **10 Trainers**, from Brock to the mysterious **Defending Champion ?**
- Each Trainer uses a Stockfish-powered AI with increasing difficulty.
- Before selecting a Trainer, the player chooses to play as **Red (White)** or **Blue (Black)**.

---

## 🧠 AI & Difficulty Progression

- Each computer opponent is backed by **Stockfish (WebAssembly)**.
- Difficulty increases via tuned engine parameters (skill level, search depth, and move time).
- The final opponent, **Defending Champion ?**, uses the strongest configuration and mirrors the opposing rival (Red or Blue).

---

## 🎨 Presentation & UX

- Custom **Red vs Blue** visual theme.
- Retro-inspired pixel UI with modern animations.
- Animated menu intro with logo reveal and sound effects.
- Smooth piece movement, capture animations, and visual feedback for check and checkmate.
- Fully playable with mouse or keyboard.

---

## 🔊 Audio System

- Menu and gameplay background music with smooth fade-in/out.
- Distinct sound effects for:
  - Button interactions
  - Piece movement
  - Captures
  - Check and checkmate
- Global audio controls for music and sound effects.

---

## 📁 Project Structure

```
components/
  ├─ IntroSequence.tsx
  ├─ ChessBoard.tsx
services/
  ├─ engine.ts
  ├─ audio.ts
constants.ts
types.ts

```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v16+

### Installation

```bash
git clone https://github.com/Paradivus/champions-gambit.git
cd champions-gambit
npm install
```

### Start Development Server

```bash
npm start
```

Open `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
```

The optimized build will be generated in the `dist/` directory.

---

## 🎯 What This Project Demonstrates

- Clean separation of UI, game logic, and AI layers
- Deterministic chess implementation with external engine integration
- Progressive AI difficulty tuning
- Polished UI/UX with coordinated animation and audio systems

---

## ⚠️ Disclaimer

Champion’s Gambit is a fan-made, non-commercial project created for educational purposes.

Pokémon and related characters are trademarks of Nintendo, Game Freak, and Creatures Inc.

---

## 📄 License

This project is open source and available under the **MIT License**.
