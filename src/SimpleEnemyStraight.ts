import GameScene from "./GameScene";
import ITiledObject from "./base/ITiledObject";
import IEnemy from "./IEnemy";
import Bullet from "./Bullet";

export default class SimpleEnemyStraight extends Phaser.Sprite implements IEnemy {
	// Keep in order to communicate with root
	private scene: GameScene;
	private lifeTime: number;

	constructor(scene: GameScene, objectProperties: ITiledObject) {
		// Matches the 'player' image loaded in GameScene
		super(scene.game, objectProperties.x, objectProperties.y, 'simpleEnemyStraight', 0);

		this.scene = scene;
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

	public hasBeenHitByBullet(bullet: Bullet) {
		// And notify the scene so that we remove it from the list
		this.scene.removeEnemy(this);
		// And also the bullet
		this.scene.removePlayerBullet(bullet);
	}
}

