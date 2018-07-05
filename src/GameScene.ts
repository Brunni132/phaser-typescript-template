import * as Phaser from 'phaser-ce';
import { TimesteppedScene } from "./base/TimesteppedScene";
import { Player } from "./Player";
import { Bullet } from "./Bullet";
import { BasicEnemy, EnemyBehaviourDesc } from "./base/BasicEnemy";

export class GameScene extends TimesteppedScene {
	player: Player;
	// We need to keep track of that to enable collisions to be handled at the root
	bullets: Bullet[];
	enemies: BasicEnemy[];
	bg: Phaser.TileSprite;
	walls: Phaser.Sprite[];
	leftWall: Phaser.Sprite;
	rightWall: Phaser.Sprite;

	// For use by children
	cameraOffset: number;
	cameraMoveSpeed: number;
	collisionLayer: Phaser.TilemapLayer;

	preload() {
		this.game.load.image('bg', 'assets/bg.png');
		this.game.load.tilemap('bgmap', 'assets/level01.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('bg_tiles', 'assets/level01.tmx.png');
		this.load.spritesheet('player', 'assets/player.png', 32, 16);
		this.load.image('bullet', 'assets/bullet.png');
		this.load.spritesheet('basicenemy', 'assets/basicenemy.png', 16, 16);
	}

	create() {
		this.bullets = [];
		this.enemies = [];
		this.walls = [];

		// Load BG, make it large enough
		this.bg = this.game.add.tileSprite(0, 0, 1024 * 1024, 208, 'bg');

		// And BG map
		const map = this.game.add.tilemap('bgmap');
		//  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file under tilesets[0].name)
		//  The second parameter maps this name to the Phaser.Cache key 'tiles'
		map.addTilesetImage('tileset', 'bg_tiles');
		//  Creates a layer from the 'BG' layer in the map data.
		//  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
		const layer = map.createLayer('BG');
		//  This resizes the game world to match the layer dimensions
		layer.resizeWorld();

		this.collisionLayer = map.createLayer('Collisions');
		this.collisionLayer.visible = false;
		this.game.physics.arcade.enable(this.collisionLayer);

		// Choose which tiles will collide ("firstgid":161)
		map.setCollision(162, true, 'Collisions');

		// Add player
		this.player = new Player(this, this.game.width/2, this.game.height/2);
		this.game.add.existing(this.player);

		// Add walls on top and bottom to restrict the player
		this.createSquareWall(0, -8, map.widthInPixels, 8);
		this.createSquareWall(0, map.heightInPixels, map.widthInPixels, 8);

		// Left and right walls move with the player
		this.leftWall = this.createSquareWall(-8, 0, 8, map.heightInPixels);
		this.rightWall = this.createSquareWall(this.game.width, 0, 8, map.heightInPixels);

		// Move the enemy 100 pixels left per second
		const simpleMovement = () => {
			// Return the velocity of the enemy
			return new Phaser.Point(-100, 0);
		};
		const behaviour = new EnemyBehaviourDesc(simpleMovement);
		const enemy = new BasicEnemy(this.game, 600 + this.game.width, this.game.height /2, behaviour);
		this.enemies.push(enemy);
		this.game.add.existing(enemy);

		// Initializations
		this.cameraOffset = 600;
		this.cameraMoveSpeed = 0.33;

		// Test
		// this.time.desiredFps = 20;
	}

	fixedUpdate() {
		this.player.fixedUpdate();

		// Collide the player simply with the BG
		this.game.physics.arcade.collide(this.player, this.collisionLayer);

		// More interesting, collide bullets with the walls
		for (const bullet of this.bullets) {
			bullet.fixedUpdate();
			if (this.game.physics.arcade.collide(bullet, this.collisionLayer)) {
				bullet.hitAWall();
			}
		}

		for (const enemy of this.enemies) {
			enemy.fixedUpdate();
			// Check collisions between bullets and enemies
			for (const bullet of this.bullets) {
				if (this.game.physics.arcade.overlap(bullet, enemy)) {
					enemy.hasBeenHitByBullet(bullet);
				}
			}

			// And also players vs the enemy
			if (this.game.physics.arcade.overlap(this.player, enemy)) {
				this.player.hasBeenHitByEnemy(enemy);
			}
		}

		// Collision with walls
		for (const wall of this.walls) {
			this.game.physics.arcade.collide(wall, this.player);
		}

		// Scroll screen by moving camera
		this.cameraOffset += this.cameraMoveSpeed;
		this.game.camera.x = this.cameraOffset;

		// Scroll BG faster
		this.bg.x = -7 * this.cameraOffset;

		// Move walls with camera
		this.leftWall.x = this.cameraOffset - this.leftWall.width;
		this.rightWall.x = this.cameraOffset + this.game.width;
	}

	createSquareWall(x: number, y: number, width: number, height: number): Phaser.Sprite {
		const wall = this.game.add.sprite(x, y);
		this.game.physics.arcade.enableBody(wall);
		wall.body.immovable = true;
		wall.body.setSize(width, height);
		this.walls.push(wall);
		return wall;
	}

	fadeOut() {
		this.camera.fade(0, 1 * Phaser.Timer.SECOND);
		this.camera.onFadeComplete.add(() => {
			// Reboot game for now
			this.game.state.start('Boot');
		});
	}

	playerHasDied(player: Player) {
		// One second later, fade out
		this.game.time.events.add(1 * Phaser.Timer.SECOND, () => {
			this.fadeOut();
		});
	}

	spawnPlayerBullet(x: number, y: number, shotBulletSpeed: number) {
		const bullet = new Bullet(this.game, x, y, shotBulletSpeed);
		this.game.add.existing(bullet);
		this.bullets.push(bullet);
	}
}
