import { Container, Graphics } from 'pixi.js';
import { GAME_CONFIG, COLORS, TILE_TYPES } from '../constants/game-config';
import type { Position, TileData, Match } from '../types/game-types';
import { Tile } from './tile';
import gsap from 'gsap';

interface GameBoardProps {
    onTileClick: (tile: Tile) => void;
}

export class GameBoard extends Container {
    private tiles: Tile[][] = [];
    private boardBackground: Graphics = new Graphics();
    private readonly onTileClick: (tile: Tile) => void;
    
    constructor({ onTileClick }: GameBoardProps) {
        super();
        this.onTileClick = onTileClick;
        
        this.eventMode = 'static';
        this.sortableChildren = true;
        
        this.createBackground();
        this.initializeBoard();
    }
    
    public swapTiles(tile1: Tile, tile2: Tile): void {
        const pos1 = tile1.getTilePosition();
        const pos2 = tile2.getTilePosition();

        // Update positions in the tiles array
        this.tiles[pos1.y][pos1.x] = tile2;
        this.tiles[pos2.y][pos2.x] = tile1;

        // Update tile positions
        tile1.setPosition(pos2);
        tile2.setPosition(pos1);
    }
    
    private createBackground(): void {
        this.boardBackground
            .clear()
            .beginFill(COLORS.BOARD)
            .drawRect(
                0,
                0,
                GAME_CONFIG.BOARD_SIZE * GAME_CONFIG.TILE_SIZE,
                GAME_CONFIG.BOARD_SIZE * GAME_CONFIG.TILE_SIZE
            )
            .endFill();
        
        this.boardBackground.eventMode = 'none';
        this.boardBackground.zIndex = 0;
        
        this.addChild(this.boardBackground);
    }
    
    private initializeBoard(): void {
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const tileData = this.createTileData({ x, y }, true);
                const tile = new Tile(tileData);
                
                tile.on('pointerdown', () => this.onTileClick(tile));
                
                this.tiles[y][x] = tile;
                this.addChild(tile);
            }
        }
    }
    
    private createTileData(position: Position, checkMatches: boolean = false): TileData {
        let type: TileType;
        do {
            type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)] as TileType;
        } while (checkMatches && this.wouldCreateMatch(position, type));

        return {
            type,
            position,
            id: `tile-${position.x}-${position.y}`
        };
    }

    private wouldCreateMatch(position: Position, type: TileType): boolean {
        // Check horizontal matches
        let horizontalCount = 1;
        // Check left
        for (let x = position.x - 1; x >= 0 && x >= position.x - 2; x--) {
            if (this.tiles[position.y]?.[x]?.tileData.type === type) {
                horizontalCount++;
            } else break;
        }
        // Check right
        for (let x = position.x + 1; x < GAME_CONFIG.BOARD_SIZE && x <= position.x + 2; x++) {
            if (this.tiles[position.y]?.[x]?.tileData.type === type) {
                horizontalCount++;
            } else break;
        }

        // Check vertical matches
        let verticalCount = 1;
        // Check up
        for (let y = position.y - 1; y >= 0 && y >= position.y - 2; y--) {
            if (this.tiles[y]?.[position.x]?.tileData.type === type) {
                verticalCount++;
            } else break;
        }
        // Check down
        for (let y = position.y + 1; y < GAME_CONFIG.BOARD_SIZE && y <= position.y + 2; y++) {
            if (this.tiles[y]?.[position.x]?.tileData.type === type) {
                verticalCount++;
            } else break;
        }

        return horizontalCount >= 3 || verticalCount >= 3;
    }

    public checkMatches(): Match[] {
        const matches: Match[] = [];
        
        // Check horizontal matches
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            let matchCount = 1;
            let currentType = this.tiles[y][0].tileData.type;
            let matchStartX = 0;
            
            for (let x = 1; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const currentTile = this.tiles[y][x];
                if (currentTile.tileData.type === currentType) {
                    matchCount++;
                    
                    // Check if we're at the end of the board
                    if (x === GAME_CONFIG.BOARD_SIZE - 1 && matchCount >= 3) {
                        matches.push(this.createMatchData(y, matchStartX, x, 'horizontal'));
                    }
                } else {
                    // If we found a match of 3 or more
                    if (matchCount >= 3) {
                        matches.push(this.createMatchData(y, matchStartX, x - 1, 'horizontal'));
                    }
                    matchCount = 1;
                    currentType = currentTile.tileData.type;
                    matchStartX = x;
                }
            }
        }

        // Check vertical matches
        for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
            let matchCount = 1;
            let currentType = this.tiles[0][x].tileData.type;
            let matchStartY = 0;
            
            for (let y = 1; y < GAME_CONFIG.BOARD_SIZE; y++) {
                const currentTile = this.tiles[y][x];
                if (currentTile.tileData.type === currentType) {
                    matchCount++;
                    
                    // Check if we're at the bottom of the board
                    if (y === GAME_CONFIG.BOARD_SIZE - 1 && matchCount >= 3) {
                        matches.push(this.createMatchData(x, matchStartY, y, 'vertical'));
                    }
                } else {
                    // If we found a match of 3 or more
                    if (matchCount >= 3) {
                        matches.push(this.createMatchData(x, matchStartY, y - 1, 'vertical'));
                    }
                    matchCount = 1;
                    currentType = currentTile.tileData.type;
                    matchStartY = y;
                }
            }
        }

        return matches;
    }

    private createMatchData(line: number, start: number, end: number, direction: 'horizontal' | 'vertical'): Match {
        const matchTiles: TileData[] = [];
        
        if (direction === 'horizontal') {
            for (let x = start; x <= end; x++) {
                matchTiles.push({...this.tiles[line][x].tileData});
            }
        } else { // vertical
            for (let y = start; y <= end; y++) {
                matchTiles.push({...this.tiles[y][line].tileData});
            }
        }

        return {
            tiles: matchTiles,
            score: matchTiles.length * 100
        };
    }

    public async handleMatches(matches: Match[]): Promise<void> {
        if (matches.length === 0) return;

        const removePromises: Promise<void>[] = [];
        const tilesToRemove = new Set<string>();

        // Collect all tiles to remove
        matches.forEach(match => {
            match.tiles.forEach(tileData => {
                tilesToRemove.add(tileData.id);
            });
        });

        // Remove tiles
        tilesToRemove.forEach(tileId => {
            const tile = this.getTileById(tileId);
            if (tile && !tile.destroyed) {
                removePromises.push(
                    new Promise<void>((resolve) => {
                        gsap.to(tile, {
                            alpha: 0,
                            scale: 0.8,
                            duration: 0.3,
                            onComplete: () => {
                                if (tile && !tile.destroyed) {
                                    const pos = tile.getTilePosition();
                                    this.tiles[pos.y][pos.x] = null!;
                                    tile.destroy();
                                }
                                resolve();
                            }
                        });
                    })
                );
            }
        });

        await Promise.all(removePromises);
        await this.fillEmptySpaces();
    }

    private getTileById(id: string): Tile | null {
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                if (this.tiles[y][x].tileData.id === id) {
                    return this.tiles[y][x];
                }
            }
        }
        return null;
    }

    private async fillEmptySpaces(): Promise<void> {
        const fallPromises: Promise<void>[] = [];

        // Process each column
        for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
            // Start from the bottom, move upwards
            for (let y = GAME_CONFIG.BOARD_SIZE - 1; y >= 0; y--) {
                if (!this.tiles[y][x]) {
                    // Find the first non-null tile above
                    let sourceY = y - 1;
                    while (sourceY >= 0 && !this.tiles[sourceY][x]) {
                        sourceY--;
                    }

                    if (sourceY >= 0) {
                        // Move tile down
                        const tile = this.tiles[sourceY][x];
                        this.tiles[y][x] = tile;
                        this.tiles[sourceY][x] = null;

                        fallPromises.push(
                            new Promise<void>((resolve) => {
                                gsap.to(tile, {
                                    y: y * GAME_CONFIG.TILE_SIZE,
                                    duration: 0.3,
                                    ease: 'bounce.out',
                                    onComplete: () => {
                                        tile.setPosition({ x, y });
                                        resolve();
                                    }
                                });
                            })
                        );
                    } else {
                        // Create new tile at the top
                        const tileData = this.createTileData({ x, y: 0 });
                        const newTile = new Tile(tileData);
                        newTile.y = -GAME_CONFIG.TILE_SIZE;
                        newTile.on('pointerdown', () => this.onTileClick(newTile));
                        
                        this.tiles[y][x] = newTile;
                        this.addChild(newTile);

                        fallPromises.push(
                            new Promise<void>((resolve) => {
                                gsap.to(newTile, {
                                    y: y * GAME_CONFIG.TILE_SIZE,
                                    duration: 0.3,
                                    ease: 'bounce.out',
                                    onComplete: () => {
                                        newTile.setPosition({ x, y });
                                        resolve();
                                    }
                                });
                            })
                        );
                    }
                }
            }
        }

        await Promise.all(fallPromises);
    }
} 