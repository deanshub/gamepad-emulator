import './style.css'
import { Emulator } from './emulator';
import { GameSearch } from './gameSearch';

let emulator: Emulator;

window.onload = () => {
  emulator = new Emulator();
  new GameSearch();
};

interface Game {
  name: string;
  path: string;
}

// Remove the loadGame function and replace it with an event listener
document.addEventListener('gameSelected', async (event: Event) => {
    const game = (event as CustomEvent<Game>).detail;
    try {
        const response = await fetch(game.path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const romBuffer = await response.arrayBuffer();
        const file = new File([romBuffer], game.name, { type: 'application/octet-stream' });
        emulator.loadROM(file);
        console.log(`Loaded game: ${game.name}`);
    } catch (error) {
        console.error(`Failed to load game: ${game.name}`, error);
    }
});
