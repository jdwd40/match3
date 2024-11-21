import { Application } from 'pixi.js';
import { GAME_CONFIG, COLORS } from './constants/game-config';
import { GameBoard } from './entities/game-board';
import { GameUI } from './entities/game-ui';
import { Tile } from './entities/tile';
import type { Match } from './types/game-types';

export class Game {
    private app: Application;
    private gameBoard!: GameBoard;
    private gameUI!: GameUI;
    private selectedTile: Tile | null = null;
    
    constructor() {
        this.app = new Application({
            width: GAME_CONFIG.BOARD_SIZE * GAME_CONFIG.TILE_SIZE,
            height: GAME_CONFIG.BOARD_SIZE * GAME_CONFIG.TILE_SIZE + 100,
            backgroundColor: COLORS.BACKGROUND,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: true,
            hello: true,
            powerPreference: 'high-performance'
        });
        
        document.body.appendChild(this.app.view as HTMLCanvasElement);
        
        this.app.ticker.add(this.update.bind(this));
        
        this.initialize();
    }
    
    private async initialize(): Promise<void> {
        await this.setupGame();
    }
    
    private async setupGame(): Promise<void> {
        this.gameBoard = new GameBoard({
            onTileClick: this.handleTileClick.bind(this)
        });
        this.gameBoard.position.set(0, 0);
        this.app.stage.addChild(this.gameBoard);

        this.gameUI = new GameUI();
        this.gameUI.position.set(0, GAME_CONFIG.BOARD_SIZE * GAME_CONFIG.TILE_SIZE);
        this.app.stage.addChild(this.gameUI);
    }

    private update(deltaTime: number): void {
        // Game update loop will go here
    }

    private handleTileClick(tile: Tile): void {
        if (!this.selectedTile) {
            this.selectedTile = tile;
            tile.setSelected(true);
            return;
        }

        if (this.selectedTile === tile) {
            this.selectedTile.setSelected(false);
            this.selectedTile = null;
            return;
        }

        if (this.areAdjacent(this.selectedTile, tile)) {
            this.swapTiles(this.selectedTile, tile);
        } else {
            this.selectedTile.setSelected(false);
            tile.setSelected(true);
            this.selectedTile = tile;
        }
    }

    private areAdjacent(tile1: Tile, tile2: Tile): boolean {
        const pos1 = tile1.getTilePosition();
        const pos2 = tile2.getTilePosition();
        
        const xDiff = Math.abs(pos1.x - pos2.x);
        const yDiff = Math.abs(pos1.y - pos2.y);
        
        return (xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1);
    }

    private async swapTiles(tile1: Tile, tile2: Tile): Promise<void> {
        this.gameBoard.swapTiles(tile1, tile2);
        this.selectedTile?.setSelected(false);
        this.selectedTile = null;

        // Check for matches after swap
        const matches = this.gameBoard.checkMatches();
        if (matches.length > 0) {
            const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
            this.gameUI.updateScore(totalScore);
            await this.gameBoard.handleMatches(matches);
        }
    }
}

window.addEventListener('load', () => {
    new Game();
}); 