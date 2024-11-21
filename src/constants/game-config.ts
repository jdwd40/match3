export const GAME_CONFIG = {
    BOARD_SIZE: 8,
    TILE_SIZE: 64,
    SWAP_ANIMATION_DURATION: 0.2,
    FALL_ANIMATION_DURATION: 0.3,
    MATCH_MIN_LENGTH: 3
} as const;

export const COLORS = {
    BACKGROUND: 0x1a1a1a,
    BOARD: 0x2d2d2d,
    UI_TEXT: 0xffffff
} as const;

export const TILE_TYPES = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange'
] as const; 