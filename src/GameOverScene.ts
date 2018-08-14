import TimesteppedScene from "./base/TimesteppedScene";

export default class GameOverScene extends TimesteppedScene {
	private playerScore: number;

	/**
	 * Load sprites and various assets here.
	 */
	preload() {
		this.game.load.image('gameOverImage', 'assets/gameOverImage.png');
		this.game.load.spritesheet('restartButton', 'assets/restartButton.png', 200, 40);
		this.game.load.bitmapFont('uifont', 'assets/uifont.png', 'assets/uifont.fnt');
	}

	/**
	 * Ran once at initialization.
	 */
	create() {
		// Background
		const bg = this.game.add.sprite(this.game.width / 2, 0, 'gameOverImage');
		bg.anchor.set(0.5, 1);

		this.game.add.tween(bg).to({y: 280}, 2400, Phaser.Easing.Bounce.Out, true);

		// Restart button
		const button = this.game.add.button(this.game.width / 2 - 95, 340, 'restartButton', this.onClickContinueButton, this, 2, 0, 1);
		button.alpha = 0;
		this.game.add.tween(button).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 2500);

		// Show the score
		const scoreLabel = this.game.add.bitmapText(this.game.width / 2, 300, 'uifont', `SCORE   ${this.playerScore}`, 24);
		scoreLabel.anchor.set(0.5, 0);
		scoreLabel.alpha = 0;
		this.game.add.tween(scoreLabel).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 2200);
	}

	/**
	 * https://phaser.io/docs/2.4.4/Phaser.State.html#init
	 */
	init(playerScore: number) {
		// Keep for later
		this.playerScore = playerScore;
	}

	/**
	 * Ran every frame (this.fixedDt).
	 */
	fixedUpdate(dt: number) {
		// Skip to next scene with space or return
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			this.onClickContinueButton();
		}
	}

	/**
	 * Callback for button.
	 */
	onClickContinueButton() {
		this.game.state.start('TitleScene');
	}
}
