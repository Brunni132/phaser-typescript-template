import TimesteppedScene from "./base/TimesteppedScene";
import Bullet from './Bullet';
import Player from './Player';
import SimpleEnemyStraight from './SimpleEnemyStraight';
import SimpleEnemySine from './SimpleEnemySine';
import ITiledObject from "./base/ITiledObject";
import IEnemy from "./IEnemy";

export default class GameScene extends TimesteppedScene {
	public static scrollSpeed = 90;
	private bg1: Phaser.TileSprite;
	private bg2: Phaser.TileSprite;
	private scoreValueLabel: Phaser.BitmapText;
	private lifeValueRectInner: Phaser.Sprite;
	private lifeValueRectOuter: Phaser.Sprite;
	private player: Player;
	private enemies: IEnemy[];
	// We need to keep track of that to enable collisions to be handled at the root
	private playerBullets: Bullet[];

	preload() {
		this.game.load.image('bg', 'assets/bg.png');
		this.game.load.tilemap('bgmap', 'assets/level01.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('bg_tiles', 'assets/level01.tmx.png');
		this.load.spritesheet('player', 'assets/player.png', 24, 24);
		this.game.load.image('simpleEnemyStraight', 'assets/simpleEnemyStraight.png');
		this.game.load.image('simpleEnemySine', 'assets/simpleEnemySine.png');
		this.game.load.image('bullet', 'assets/bullet.png');
		this.game.load.bitmapFont('uifont', 'assets/uifont.png', 'assets/uifont.fnt');
		this.game.load.image('lifeUiBackground', 'assets/lifeUiBackground.png');
		this.game.load.image('lifeUiForeground', 'assets/lifeUiForeground.png');
	}

	create() {
		// Variables
		this.enemies = [];
		this.playerBullets = [];
		this.game.camera.x = 0;

		// Two backgrounds added on top of each other for the starfield
		this.bg1 = this.game.add.tileSprite(0, 0, 7680, 480, 'bg');
		this.bg2 = this.game.add.tileSprite(0, 0, 7680, 480, 'bg');

		this.bg1.anchor.set(0, 0);
		this.bg2.anchor.set(0, 0);
		this.bg1.tileScale.set(2, -2);
		this.bg2.tileScale.set(2, 2);
		this.bg1.blendMode = PIXI.blendModes.ADD;
		this.bg2.blendMode = PIXI.blendModes.ADD;

		// And BG map
		const map = this.game.add.tilemap('bgmap');
		map.addTilesetImage('tileset', 'bg_tiles');
		const layer = map.createLayer('BG');
		layer.resizeWorld();

		// Spawn objects (enemies and various items)
		const objectList = (map.objects as any).Objects as ITiledObject[];
		for (const object of objectList) {
			switch (object.type) {
				case 'SimpleEnemySine':
					this.enemies.push(new SimpleEnemySine(this, object));
					break;
				case 'SimpleEnemyStraight':
					this.enemies.push(new SimpleEnemyStraight(this, object));
					break;
				default:
					console.error(`Unknown object type ${object.type}`, object);
					break;
			}
		}

		// The player (start at the center of the screen)
		this.player = new Player(this, this.game.width / 2, this.game.height / 2);

		// Score UI
		const scoreLabel = this.game.add.bitmapText(0, 0, 'uifont', 'SCORE', 24);
		scoreLabel.fixedToCamera = true;

		this.scoreValueLabel = this.game.add.bitmapText(300, 0, 'uifont', '0', 24);
		// Align to the right
		this.scoreValueLabel.anchor.set(1, 0);
		this.scoreValueLabel.fixedToCamera = true;

		// Life UI
		const lifeLabel = this.game.add.bitmapText(0, 24, 'uifont', 'LIFE', 24);
		lifeLabel.fixedToCamera = true;

		this.lifeValueRectOuter = this.game.add.sprite(150, 24, 'lifeUiBackground');
		this.lifeValueRectOuter.fixedToCamera = true;

		this.lifeValueRectInner = this.game.add.sprite(152, 26, 'lifeUiForeground');
		this.lifeValueRectInner.fixedToCamera = true;
		this.lifeValueRectInner.smoothed = false;

		// Initial placement of UI
		this.updateUI();
	}

	fixedUpdate(dt: number) {
		// Scroll depending on the time
		this.game.camera.x += GameScene.scrollSpeed * dt;

		// Position BGs
		this.bg1.tilePosition.x = (this.game.camera.x * 0.25);
		this.bg2.tilePosition.x = (this.game.camera.x * -4);

		// Update elements in hierarchy
		this.player.fixedUpdate(dt);

		for (const enemy of this.enemies) {
			// Only update if in viewport, so that they don't start too far from where we were set up in the editor
			if (enemy.x < this.game.camera.x + this.game.camera.width + enemy.width) {
				enemy.fixedUpdate(dt);

				// Check collision with the player
				if (this.game.physics.arcade.overlap(this.player, enemy)) {
					this.player.hasBeenHitByEnemy(enemy);
				}

				// Check collisions between player bullets (friendly) and enemies
				for (const bullet of this.playerBullets) {
					if (this.game.physics.arcade.overlap(bullet, enemy)) {
						enemy.hasBeenHitByBullet(bullet);
					}
				}
			}
		}

		// Destroy bullets outside of the screen
		for (const bullet of this.playerBullets) {
			if (bullet.x > this.game.camera.x + this.game.width) {
				this.removePlayerBullet(bullet);
			}
		}
	}

	// Called by child game elements to tell that the score changed
	public increaseScore(by: number) {
		this.player.score += by;
		this.updateUI();
	}

	public removePlayerBullet(bullet: Bullet) {
		// Remove friendly bullet from the list
		this.playerBullets.splice(this.playerBullets.indexOf(bullet), 1);
		bullet.destroy(true);
	}

	public removeEnemy(enemy: IEnemy) {
		// Remove enemy from the list
		this.enemies.splice(this.enemies.indexOf(enemy), 1);
		enemy.destroy(true);
	}

	// Shoots a bullet for a player and keeps track of it
	public spawnPlayerBullet(x: number, y: number, shotBulletSpeed: number) {
		this.playerBullets.push(new Bullet(this, x, y, shotBulletSpeed));
	}

	// Updates the UI (score, life)
	public updateUI() {
		this.scoreValueLabel.text = this.player.score.toString();

		// Scale container (bar)
		const maxBarWidth = this.lifeValueRectOuter.width - 4; // borders are 2 pixels each
		// Do not draw a life bar less than 0 (when the character is dead, he may have a life lower)
		const life = Math.max(0, this.player.life);
		this.lifeValueRectInner.scale.set(life * maxBarWidth, 1);
	}
}
