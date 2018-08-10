import TimesteppedScene from "./base/TimesteppedScene";
import Player from './Player';

export default class GameScene extends TimesteppedScene {
	public static scrollSpeed = 90;
	private bg1: Phaser.TileSprite;
	private bg2: Phaser.TileSprite;
	private player: Player;

	preload() {
		this.game.load.image('bg', 'assets/bg.png');
		this.game.load.tilemap('bgmap', 'assets/level01.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('bg_tiles', 'assets/level01.tmx.png');
		this.game.load.image('player', 'assets/player.png');
	}

	create() {
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

		// The player (start at the center of the screen)
		this.player = new Player(this, this.game.width / 2, this.game.height / 2);
		// This time it's not added directly (this.game.add.xxxx) so we need to add it to the scene hierarchy
		this.game.add.existing(this.player);
	}

	fixedUpdate(dt: number) {
		// Scroll depending on the time
		this.game.camera.x += GameScene.scrollSpeed * dt;

		// Position BGs
		this.bg1.tilePosition.x = (this.game.camera.x * 0.25);
		this.bg2.tilePosition.x = (this.game.camera.x * -4);

		// Update elements in hierarchy
		this.player.fixedUpdate(dt);
	}
}
