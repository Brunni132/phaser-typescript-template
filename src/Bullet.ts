import GameScene from "./GameScene";

export default class Bullet extends Phaser.Sprite {
	// Keep in order to communicate with root
	private scene: GameScene;

	// Constructs a bullet which has an initial velocity (vx)
	constructor(scene: GameScene, x: number, y: number, vx: number) {
		super(scene.game, x, y, 'bullet', 0);
		this.scene = scene;

		this.game.physics.arcade.enableBody(this);

		// Set the bullet to have the speed passed in parameter. Flip it if negative, since the sprite is looking right.
		this.body.velocity.x = vx;

		this.smoothed = false;
		this.scale.x = vx > 0 ? 1 : -1;
		// Anchor it accordingly
		this.anchor.setTo(vx > 0 ? 0 : 1, 0.5);
		scene.game.add.existing(this);
	}

	fixedUpdate(dt: number) {
	}
}

