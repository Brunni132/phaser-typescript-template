import GameScene from "./GameScene";
import IEnemy from "./IEnemy";
import { arrayWithRange } from "./utils";

enum AnimationState {
	normal = 'normal',
	upwards = 'upwards',
	downwards = 'downwards',
	destroyed = 'destroyed',
}

export default class Player extends Phaser.Sprite {
	private static readonly TargetSpeed = 300;
	private static readonly AccelerationMultiplier = 0.2;
	private static readonly BulletRepeatDelayMs = 200;
	private static readonly ShotBulletSpeed = 700;
	private static readonly InvincibleTimeAfterHit = 1;
	private vx: number;
	private vy: number;
	private currentState: AnimationState;
	private lastShotAt: number;
	// Keep in order to communicate with root
	private scene: GameScene;
	public score: number;
	// Between 0 and 1, the portion of life
	public life: number;
	// When set to a non-zero value, the sprite will be blinking for the given number of ms
	private blinkingTimeSec: number;

	constructor(scene: GameScene, x: number, y: number) {
		// Matches the 'player' image loaded in GameScene
		super(scene.game, x, y, 'player', 0);

		// Start still
		this.vx = this.vy = 0;
		// Start with full life
		this.life = 1;
		this.score = 0;
		this.blinkingTimeSec = 0;

		// No bilinear filtering
		this.smoothed = false;
		this.scale.set(2);
		// Position via the middle
		this.anchor.setTo(0.5, 0.5);
		// This time it's not added directly (this.game.add.xxxx) so we need to add it to the scene hierarchy
		scene.game.add.existing(this);
		this.game.physics.arcade.enableBody(this);

		// Animations
		this.animations.add(AnimationState.normal, [0, 1], 10, true);
		this.animations.add(AnimationState.downwards, [2, 3], 10, true);
		this.animations.add(AnimationState.upwards, [4, 5], 10, true);
		this.animations.add(AnimationState.destroyed, arrayWithRange(8, 41), 60, false);

		// Other variables
		this.scene = scene;
		this.lastShotAt = this.game.time.now;
	}

	public fixedUpdate(dt: number) {
		// Nothing to do when dead
		if (this.currentState === AnimationState.destroyed) {
			return;
		}

		let targetVX = 0, targetVY = 0;

		// Move the ship with input
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			targetVX = -Player.TargetSpeed
		} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			targetVX = +Player.TargetSpeed
		}

		if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
			targetVY = -Player.TargetSpeed
		} else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
			targetVY = +Player.TargetSpeed
		}

		// Bullet shooting support
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) &&
			this.game.time.now - this.lastShotAt >= Player.BulletRepeatDelayMs)
		{
			// Shoot from the right part of our ship
			this.scene.spawnPlayerBullet(this.x + this.width / 2, this.y, Player.ShotBulletSpeed);
			this.lastShotAt = this.game.time.now;
		}

		// Apply acceleration to velocity (use the physics engine this time)
		this.body.velocity.x += (targetVX - this.body.velocity.x) * Player.AccelerationMultiplier;
		this.body.velocity.y += (targetVY - this.body.velocity.y) * Player.AccelerationMultiplier;

		// Right animation type depending on velocity
		if (this.body.velocity.y >= Player.TargetSpeed * 0.9) {
			this.setState(AnimationState.upwards);
		} else if (this.body.velocity.y <= -Player.TargetSpeed * 0.9) {
			this.setState(AnimationState.downwards);
		} else {
			this.setState(AnimationState.normal);
		}

		// Make sure that player stays in bounds
		if (this.x < this.game.camera.x) {
			this.x = this.game.camera.x;
		}
		if (this.x > this.game.camera.x + this.game.width) {
			this.x = this.game.camera.x + this.game.width;
		}
		this.y = Math.max(0, Math.min(this.game.height, this.y));

		// Blinking animation
		if (this.blinkingTimeSec > 0) {
			this.visible = !this.visible;

			this.blinkingTimeSec -= dt;

			// Ensure that we leave the state being visible
			if (this.blinkingTimeSec < 0) {
				this.visible = true;
			}
		}
	}

	public hasBeenHitByEnemy(enemy: IEnemy) {
		// Already being destroyed, or being hit (blinking) makes you invincible for a while
		if (this.currentState === AnimationState.destroyed || this.blinkingTimeSec > 0) {
			return;
		}

		// Being hit reduces the life. If it goes below zero, we destroy the character
		this.life -= enemy.lifeDamage;
		this.scene.updateUI();

		if (this.life <= 0) {
			// No more life, the player is destroyed for good
			this.currentState = AnimationState.destroyed;

			// Play a destroy animation and kill ourselves
			this.animations.play(AnimationState.destroyed);
			this.animations.currentAnim.onComplete.add(() => {
				this.game.state.start('GameOverScene', true, false, this.score);
			});
			this.body.velocity.x = this.body.velocity.y = 0;

		} else {
			// Just hit. Make ourselves invincible (blinking) for a while.
			this.blinkingTimeSec = Player.InvincibleTimeAfterHit;
		}
	}

	setState(state: AnimationState) {
		if (state !== this.currentState) {
			this.currentState = state;
			this.animations.play(this.currentState);
		}
	}
}

