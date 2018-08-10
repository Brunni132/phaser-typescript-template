import GameScene from "./GameScene";
import TimesteppedScene from "./base/TimesteppedScene";

export default class Player extends Phaser.Sprite {
	private static readonly TargetSpeed = 300;
	private static readonly AccelerationMultiplier = 0.2;
	private vx: number;
	private vy: number;

	constructor(scene: GameScene, x: number, y: number) {
		// Matches the 'player' image loaded in GameScene
		super(scene.game, x, y, 'player', 0);

		// Start still
		this.vx = this.vy = 0;

		// No bilinear filtering
		this.smoothed = false;
		this.scale.set(2);
		// Position via the middle
		this.anchor.setTo(0.5, 0.5);
	}

	fixedUpdate(dt: number) {
		let targetVX = 0, targetVY = 0;

		// Move the ship with input
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			targetVX = -Player.TargetSpeed;
		} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			// Compensate the scrolling for the movement of the player
			targetVX = +Player.TargetSpeed + GameScene.scrollSpeed;
		}

		if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
			targetVY = -Player.TargetSpeed;
		} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
			targetVY = +Player.TargetSpeed;
		}

		// Apply acceleration to velocity (quick integration)
		this.vx += (targetVX - this.vx) * Player.AccelerationMultiplier;
		this.vy += (targetVY - this.vy) * Player.AccelerationMultiplier;

		// Apply velocity to position
		this.x += this.vx * dt;
		this.y += this.vy * dt;

		// Make sure that player stays in bounds
		if (this.x < this.game.camera.x) {
			this.x = this.game.camera.x;
		}
		if (this.x > this.game.camera.x + this.game.width) {
			this.x = this.game.camera.x + this.game.width;
		}
		this.y = Math.max(0, Math.min(this.game.height, this.y));
	}
}

