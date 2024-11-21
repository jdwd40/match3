import { Container, Text } from 'pixi.js';
import { COLORS } from '../constants/game-config';
import gsap from 'gsap';

export class GameUI extends Container {
    private scoreText: Text = new Text('0', {
        fontSize: 24,
        fill: COLORS.UI_TEXT,
    });
    private score: number = 0;
    private scorePopup: Text | null = null;

    constructor() {
        super();
        this.createScoreDisplay();
    }

    private createScoreDisplay(): void {
        const scoreLabel = new Text('Score:', {
            fontSize: 24,
            fill: COLORS.UI_TEXT,
        });
        scoreLabel.position.set(10, 10);
        this.addChild(scoreLabel);

        this.scoreText.position.set(100, 10);
        this.addChild(this.scoreText);
    }

    public updateScore(newScore: number): void {
        this.score += newScore;
        this.scoreText.text = this.score.toString();
        this.showScorePopup(newScore);
    }

    private showScorePopup(points: number): void {
        if (this.scorePopup) {
            this.removeChild(this.scorePopup);
        }

        this.scorePopup = new Text(`+${points}!`, {
            fontSize: 36,
            fill: 0xffff00,
            fontWeight: 'bold'
        });

        this.scorePopup.anchor.set(0.5);
        this.scorePopup.position.set(
            this.width / 2,
            this.height / 2
        );

        this.addChild(this.scorePopup);

        gsap.fromTo(this.scorePopup, 
            { 
                alpha: 1,
                scale: 0.5,
                y: this.scorePopup.y 
            },
            {
                alpha: 0,
                scale: 1.5,
                y: this.scorePopup.y - 50,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => {
                    if (this.scorePopup) {
                        this.removeChild(this.scorePopup);
                        this.scorePopup = null;
                    }
                }
            }
        );
    }
} 