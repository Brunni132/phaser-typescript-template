import { Game } from "./base/Game";

import phaser_ce from "phaser-ce/build/custom/pixi";
import phaser_ce0 from "phaser-ce/build/custom/p2";
import phaser_ce01 from "phaser-ce/build/custom/phaser-split";

(window as any).PIXI   = phaser_ce;
(window as any).p2     = phaser_ce0;
(window as any).Phaser = phaser_ce01;

const game = new Game();

