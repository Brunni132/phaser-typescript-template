import TimesteppedScene from "./base/TimesteppedScene";

export default class TitleScene extends TimesteppedScene {
	private bg: Phaser.TileSprite;
	private lifeTime: number;

	/**
	 * Load sprites and various assets here.
	 */
	preload() {
		this.game.load.image('bg', 'assets/bg.png');
		this.game.load.image('titleImage', 'assets/titleImage.png');
		this.game.load.spritesheet('startButton', 'assets/startButton.png', 200, 40);
	}

	/**
	 * Ran once at initialization.
	 */
	create() {
		// Background
		this.bg = this.game.add.tileSprite(0, 0, 796, 448, 'bg');
		this.lifeTime = 0;

		const titleImage = this.game.add.sprite(this.game.width / 2, 10, 'titleImage');
		titleImage.anchor.set(0.5, 0);

		const button = this.game.add.button(this.game.width / 2 - 95, 350, 'startButton', this.buttonOnClick, this, 2, 0, 1);
	}

	/**
	 * Ran every frame (this.fixedDt).
	 */
	fixedUpdate(dt: number) {
		this.lifeTime += dt;

		// Move background in a ring
		const angle = this.lifeTime * 2;
		this.bg.tilePosition.x = 60 * Math.cos(angle);
		this.bg.tilePosition.y = -120 * Math.sin(angle);

		// Skip to next scene with space or return
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			this.buttonOnClick();
		}
	}

	/**
	 * Callback for button.
	 */
	buttonOnClick() {
		this.game.state.start('GameScene');
	}
}
