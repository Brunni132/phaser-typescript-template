import GameScene from "./GameScene";
import ITiledObject from "./base/ITiledObject";
import IEnemy from "./IEnemy";

export default class SimpleEnemyStraight extends Phaser.Sprite implements IEnemy {
	private lifeTime: number;

	constructor(scene: GameScene, objectProperties: ITiledObject) {
		// Matches the 'player' image loaded in GameScene
		super(scene.game, objectProperties.x, objectProperties.y, 'simpleEnemyStraight', 0);

		this.lifeTime = 0;
		// No bilinear filtering
		this.smoothed = false;
		// Position via the middle
		this.anchor.setTo(0.5, 0.5);
		scene.game.add.existing(this);
		this.game.physics.arcade.enableBody(this);
	}

	public fixedUpdate(dt: number) {
		this.lifeTime += dt;

		// Simple horizontal movement
		const vx = -100;
		this.x += vx * dt;
	}
}
