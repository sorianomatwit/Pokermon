import Phaser from 'phaser'

import Bootstrap from './scene/Bootstrap'
import Game from './scene/Game'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		width: window.innerWidth,
		height: window.innerHeight
	},
	scene: [Bootstrap, Game]
}

export default new Phaser.Game(config)