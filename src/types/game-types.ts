import { TILE_TYPES } from '../constants/game-config';

export type TileType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Position {
    x: number;
    y: number;
}

export interface TileData {
    type: TileType;
    position: Position;
    id: string;
}

export interface Match {
    tiles: TileData[];
    score: number;
} 