import GameScene from "./GameScene";
import ITiledObject from "./base/ITiledObject";
import IEnemy from "./IEnemy";
import Bullet from "./Bullet";

export default class SimpleEnemySine extends Phaser.Sprite implements IEnemy {
	// Keep in order to communicate with root
	private scene: GameScene;
	private lifeTime: number;
	public lifeDamage: number;

	constructor(scene: GameScene, objectProperties: ITiledObject) {
		// Matches the 'player' image loaded in GameScene
		super(scene.game, objectProperties.x, objectProperties.y, 'simpleEnemySine', 0);

		this.scene = scene;
		this.lifeTime = 0;
		this.lifeDamage = 0.5;
		// No bilinear filtering
		this.smoothed = false;
		// Position via the middle
		this.anchor.setTo(0.5, 0.5);
		scene.game.add.existing(this);
		this.game.physics.arcade.enableBody(this);
	}

	public fixedUpdate(dt: number) {
		this.lifeTime += dt;

		// Sinusoidal movement
		const vx = -100;
		const vy = Math.sin(this.lifeTime * 5) * 100;
		this.x += vx * dt;
		this.y += vy * dt;
	}

	public hasBeenHitByBullet(bullet: Bullet) {
		// And notify the scene so that we remove it from the list
		this.scene.removeEnemy(this);
		// And also the bullet
		this.scene.removePlayerBullet(bullet);
		// Score up
		this.scene.increaseScore(150);
	}
}

