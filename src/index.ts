/**
 * This file just bootstraps the game. Add your scenes here and then start the ones that you want by using
 * game.state.start.
 */
import "phaser-ce"; // Just imports types
import Boot from "./base/Boot";
import TitleScene from "./TitleScene";
import GameScene from "./GameScene";

// We chose this resolution for a 16:9 ratio according to the art I drew
const game = new Phaser.Game(796, 448, Phaser.AUTO, 'content', null);
game.state.add('Boot', Boot, false);
game.state.add('TitleScene', TitleScene, false);
game.state.add('GameScene', GameScene, false);

game.state.start('Boot');
