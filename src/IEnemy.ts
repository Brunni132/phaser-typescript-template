import Bullet from "./Bullet";

/**
 * Common to all enemies.
 */
export default interface IEnemy extends Phaser.Sprite {
	// How much life it reduces on our player in case of hit
	lifeDamage: number;

	fixedUpdate(dt: number): void;
	hasBeenHitByBullet(bullet: Bullet): void;
}
