import TimesteppedScene from "./base/TimesteppedScene";
import Player from './Player';
import SimpleEnemyStraight from './SimpleEnemyStraight';
import SimpleEnemySine from './SimpleEnemySine';
import ITiledObject from "./base/ITiledObject";
import IEnemy from "./IEnemy";

export default class GameScene extends TimesteppedScene {
	public static scrollSpeed = 90;
	private bg1: Phaser.TileSprite;
	private bg2: Phaser.TileSprite;
	private player: Player;
	private enemies: IEnemy[];

	preload() {
		this.game.load.image('bg', 'assets/bg.png');
		this.game.load.tilemap('bgmap', 'assets/level01.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('bg_tiles', 'assets/level01.tmx.png');
		this.game.load.image('player', 'assets/player.png');
		this.game.load.image('simpleEnemyStraight', 'assets/simpleEnemyStraight.png');
		this.game.load.image('simpleEnemySine', 'assets/simpleEnemySine.png');
	}

	create() {
		// Variables
		this.enemies = [];
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
			}
		}
	}
}
