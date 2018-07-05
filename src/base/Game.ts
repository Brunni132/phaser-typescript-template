import { Boot } from "./Boot";
import { Preloader } from "./Preloader";
import { GameScene } from "../GameScene";

export class Game extends Phaser.Game {

	constructor() {
		super(398, 224, Phaser.AUTO, 'content', null);

		this.state.add('Boot', Boot, false);
		this.state.add('Preloader', Preloader, false);
		this.state.add('GameScene', GameScene, false);

		this.state.start('Boot');
	}
}