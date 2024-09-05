import gamesList from './games-list.json';
export class GameSearch {
    private gameList: HTMLElement;
    private gameSearch: HTMLInputElement;
    private games: any[];
    private selectedIndex: number;

    constructor() {
        this.gameList = document.getElementById('game-list')!;
        this.gameSearch = document.getElementById('game-search') as HTMLInputElement;
        this.gameSearch.addEventListener('input', this.handleSearch.bind(this));
        this.gameSearch.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.games = [];
        this.loadGamesList();
        this.selectedIndex = -1;
    }

    private async loadGamesList() {
        try {
            this.games = gamesList;
            this.renderGameList(this.games);
        } catch (error) {
            console.error('Failed to load games list:', error);
        }
    }

    private renderGameList(games: any[]) {
        this.gameList.innerHTML = '';
        games.forEach((game) => {
            const gameElement = document.createElement('div');
            gameElement.className = 'game-item';
            gameElement.textContent = game.label;
            gameElement.addEventListener('click', () => this.selectGame(game.path));
            gameElement.setAttribute('data-index', this.games.indexOf(game).toString());
            this.gameList.appendChild(gameElement);
        });
        this.selectedIndex = -1;
    }

    private handleSearch() {
        const searchTerm = this.gameSearch.value.toLowerCase();
        const filteredGames = this.games.filter(game => 
            game.label.toLowerCase().includes(searchTerm)
        );
        this.renderGameList(filteredGames);
        this.selectedIndex = -1; // Reset the selected index when filtering
    }

    private handleKeyDown(event: KeyboardEvent) {
        const gameItems = this.gameList.querySelectorAll('.game-item');
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, gameItems.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;
            case 'Enter':
                if (this.selectedIndex >= 0) {
                    this.gameSearch.blur();
                    const selectedGame = gameItems[this.selectedIndex] as HTMLElement;
                    const gameIndex = parseInt(selectedGame.getAttribute('data-index')!);
                    const path = this.games[gameIndex].path;
                    this.selectGame(path);
                }
                break;
        }
    }

    private updateSelection() {
        const gameItems = this.gameList.querySelectorAll('.game-item');
        gameItems.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    private selectGame(path: string) {
        console.log('Selected game:', path);
        // Here you can implement logic to load the selected game
        // For example, you could dispatch a custom event that the Emulator listens for
        const event = new CustomEvent('gameSelected', { detail: { path } });
        document.dispatchEvent(event);
    }
}