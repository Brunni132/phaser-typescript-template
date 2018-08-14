import Bullet from "./Bullet";

/**
 * Common to all enemies.
 */
export default interface IEnemy extends Phaser.Sprite {
	fixedUpdate(dt: number): void;
	hasBeenHitByBullet(bullet: Bullet): void;
}
