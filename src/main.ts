import './style.css'
import { Emulator } from './emulator';
import { GameSearch } from './gameSearch';

window.onload = () => {
  new Emulator();
  new GameSearch();
};