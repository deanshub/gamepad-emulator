import gamesList from './games-list.json';
export class GameSearch {
    private gameList: HTMLElement;
    private gameSearch: HTMLInputElement;
    private games: any[];

    constructor() {
        this.gameList = document.getElementById('game-list')!;
        this.gameSearch = document.getElementById('game-search') as HTMLInputElement;
        this.gameSearch.addEventListener('input', this.handleSearch.bind(this));
        this.games = [];
        this.loadGamesList();
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
        games.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.className = 'game-item';
            gameElement.textContent = game.label;
            gameElement.addEventListener('click', () => this.selectGame(game.path));
            this.gameList.appendChild(gameElement);
        });
    }

    private handleSearch() {
        const searchTerm = this.gameSearch.value.toLowerCase();
        const filteredGames = this.games.filter(game => 
            game.label.toLowerCase().includes(searchTerm)
        );
        this.renderGameList(filteredGames);
    }

    private selectGame(path: string) {
        console.log('Selected game:', path);
        // Here you can implement logic to load the selected game
        // For example, you could dispatch a custom event that the Emulator listens for
        const event = new CustomEvent('gameSelected', { detail: { path } });
        document.dispatchEvent(event);
    }
}