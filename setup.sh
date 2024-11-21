#!/bin/bash

# Create main project directory
mkdir -p match3

# Create directory structure
cd match3
mkdir -p src/{game,scenes,utils} assets/{images,sounds} public tests

# Create source files
touch src/main.ts
touch src/game/{Board,Piece,Match,Score}.ts
touch src/scenes/{GameScene,MenuScene}.ts
touch src/utils/{Constants,Animations}.ts

# Create initial package.json and tsconfig
npm init -y
npm install typescript @types/node pixi.js --save-dev

echo "Project structure created successfully in ./match3"
