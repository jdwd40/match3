import { Container, Graphics, Text } from 'pixi.js';
import { GAME_CONFIG, COLORS } from '../constants/game-config';
import type { TileData, TileType, Position } from '../types/game-types';
import gsap from 'gsap';

export class Tile extends Container {
    private background: Graphics;
    private debugText: Text;
    private _tileData: TileData;
    private isSelected: boolean = false;

    constructor(tileData: TileData) {
        super();
        this._tileData = tileData;
        this.background = new Graphics();
        
        this.x = tileData.position.x * GAME_CONFIG.TILE_SIZE;
        this.y = tileData.position.y * GAME_CONFIG.TILE_SIZE;
        
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        this.createTileBackground();
        this.drawTile(tileData.type);
    }

    private getTileColor(type: TileType): number {
        const colors: Record<TileType, number> = {
            red: 0xff0000,
            blue: 0x0000ff,
            green: 0x00ff00,
            yellow: 0xffff00,
            purple: 0xff00ff,
            orange: 0xffa500
        };
        return colors[type];
    }

    public async remove(): Promise<void> {
        return new Promise<void>((resolve) => {
            gsap.to(this, {
                alpha: 0,
                duration: 0.3,
                onComplete: () => {
                    if (!this.destroyed) {
                        this.destroy();
                    }
                    resolve();
                }
            });
        });
    }

    public setSelected(selected: boolean): void {
        this.isSelected = selected;
        this.drawTile(this._tileData.type);
    }

    public getTilePosition(): Position {
        return this._tileData.position;
    }

    public setPosition(position: Position): void {
        this._tileData = {
            ...this._tileData,
            position
        };
        
        gsap.to(this, {
            x: position.x * GAME_CONFIG.TILE_SIZE,
            y: position.y * GAME_CONFIG.TILE_SIZE,
            duration: GAME_CONFIG.SWAP_ANIMATION_DURATION,
            ease: 'power2.out'
        });
    }

    private drawTile(type: TileType): void {
        const padding = 2;
        const size = GAME_CONFIG.TILE_SIZE - padding * 2;
        
        this.background
            .clear()
            .beginFill(this.getTileColor(type))
            .lineStyle(this.isSelected ? 3 : 0, 0xffffff)
            .drawRoundedRect(padding, padding, size, size, 8)
            .endFill();
    }

    private createTileBackground(): void {
        this.addChild(this.background);
    }

    private createDebugText(): void {
        this.debugText = new Text(this._tileData.type.charAt(0).toUpperCase(), {
            fontSize: 20,
            fill: 0xffffff
        });
        this.debugText.anchor.set(0.5);
        this.debugText.position.set(GAME_CONFIG.TILE_SIZE / 2);
        this.addChild(this.debugText);
    }

    public get tileData(): TileData {
        return this._tileData;
    }
} 