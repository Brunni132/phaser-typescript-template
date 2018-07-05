/**
 * Import Phaser dependencies using `expose-loader`.
 * This makes then available globally and it's something required by Phaser.
 * The order matters since Phaser needs them available before it is imported.
 */

import 'pixi';
import 'p2';
import { Game } from "./base/Game";

// window.Phaser = Phaser;
// window.p2 = p2;
// window.PIXI = PIXI;
const game = new Game();

