import { Bag  } from 'curvature/base/Bag';
import { Tag  } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Keyboard } from 'curvature/input/Keyboard';

import { Camera } from './Camera';

import { Actor   } from '../actor/Actor';
import { PointActor } from '../actor/PointActor';
import { TileMap } from '../tileMap/TileMap';

import { PointDump } from '../debug/PointDump';

export class Viewport extends View
{
	template  = require('./viewport.html');

	constructor(args,parent)
	{
		super(args,parent)
		// this.hud = new Hud
		this.camera  = new Camera
		this.sprites = new Bag;
		this.tileMap = new TileMap;
		this.world   = null;

		this.args.blockSize = 32;

		this.args.height = 600;
		this.args.width  = 800;

		this.args.width  = 32*16.5;
		this.args.height = 32*12.5;

		this.args.width  = 32*9.5;
		this.args.height = 32*6.5;

		this.args.x = 0;
		this.args.y = 0;

		this.args.offsetX = 0;
		this.args.offsetY = 0;

		this.blocksXY = {};

		const actor = new PointActor;

		actor.viewport = this;

		this.args.actors = [ actor ];

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;

		this.listen(window, 'gamepadconnected', event => this.padConnected(event));
	}

	onAttached(event)
	{
		const keyboard = Keyboard.get();

		keyboard.listening = true;
	}

	mousemove(event)
	{
		// this.args.x = event.clientX;
		// this.args.y = event.clientY;
	}

	update()
	{
		this.args.actors[0].sticky = !!this.args.sticky;

		if(Keyboard.get().getKey(' ') > 0)
		{
			this.args.actors[0].jump();
		}

		if(Keyboard.get().getKey('Shift') > 0)
		{
			this.args.actors[0].running  = false;
			this.args.actors[0].crawling = true;
		}
		else if(Keyboard.get().getKey('Control') > 0)
		{
			this.args.actors[0].running  = true;
			this.args.actors[0].crawling = false;
		}
		else
		{
			this.args.actors[0].running  = false;
			this.args.actors[0].crawling = false;
		}

		if(Keyboard.get().getKey('ArrowLeft') > 0)
		{
			this.args.actors[0].xAxis = -1;
		}
		else if(Keyboard.get().getKey('ArrowRight') > 0)
		{
			this.args.actors[0].xAxis = 1;
		}
		else
		{
			this.args.actors[0].xAxis = 0;
		}

		if(this.gamepad)
		{
			const gamepads = navigator.getGamepads();

			for(let i = 0; i < gamepads.length; i++)
			{
				const gamepad = gamepads.item(i);

				if(!gamepad)
				{
					continue;
				}

				if(gamepad.axes[0] && Math.abs(gamepad.axes[0]) > 0.3)
				{
					this.args.actors[0].xAxis = gamepad.axes[0] > 0 ? 1 : -1;
				}
				else
				{
					this.args.actors[0].xAxis = 0;
				}

				if(gamepad.buttons[14].pressed)
				{
					this.args.actors[0].xAxis = -1;
				}
				else if(gamepad.buttons[15].pressed)
				{
					this.args.actors[0].xAxis = 1;
				}

				if(gamepad.buttons[5].pressed)
				{
					this.args.actors[0].running  = false;
					this.args.actors[0].crawling = true;
				}
				else if(gamepad.buttons[1].pressed || gamepad.buttons[4].pressed)
				{
					this.args.actors[0].running  = true;
					this.args.actors[0].crawling = false;
				}
				else
				{
					this.args.actors[0].running  = false;
					this.args.actors[0].crawling = false;
				}

				if(gamepad.buttons[0].pressed)
				{
					this.args.actors[0].jump();
				}
			}
		}

		for(const i in this.args.actors)
		{
			this.args.actors[i].update();
		}

		const angle = this.args.actors[0].angle;

		this.args.x = -this.args.actors[0].x + this.args.width  / 2;
		this.args.y = -this.args.actors[0].y + this.args.height / 2;

		if(this.args.x > 0)
		{
			this.args.x = 0;
		}

		if(this.args.y > 0)
		{
			this.args.y = 0;
		}

		const maxPanX = -this.args.width  + (this.tileMap.mapData.width  * 32);
		const maxPanY = -this.args.height + (this.tileMap.mapData.height * 32);

		if(this.args.x < -maxPanX)
		{
			this.args.x = -maxPanX;
		}

		if(this.args.y < -maxPanY)
		{
			this.args.y = -maxPanY;
		}

		const blocksWide = Math.ceil((this.args.width  / this.args.blockSize));
		const blocksHigh = Math.ceil((this.args.height / this.args.blockSize));

		for(var i = -1; i <= blocksWide + 1; i++)
		{
			for(var j = -1; j <= blocksHigh + 1; j++)
			{
				if(!this.blocksXY[i])
				{
					this.blocksXY[i] = {};
				}

				if(!this.blocksXY[i][j])
				{
					this.blocksXY[i][j] = new Tag('<div>');
				}

				let block = this.blocksXY[i][j];

				const blockId = this.tileMap.getTileNumber(
					this.args.offsetX
						+ i
						- Math.ceil(this.args.x / this.args.blockSize)
						+ 0
					, this.args.offsetY
						+ j
						- Math.ceil(this.args.y / this.args.blockSize)
						+ 0
				);

				// block.innerText = blockId || '';

				const tileXY = this.tileMap.getTile(blockId);

				if(!this.blocks.has(block))
				{
					block.style({
						width: this.args.blockSize + 'px'
						, height: this.args.blockSize + 'px'
					});

					const transX = this.args.blockSize * i
						+ (this.args.offsetX * this.args.blockSize)
						% this.args.blockSize;

					const transY = this.args.blockSize * j
						+ (this.args.offsetY * this.args.blockSize)
						% this.args.blockSize;

					block.style({
						transform: `translate(${transX}px, ${transY}px)`
						, 'background-image': 'url(/Sonic/testTiles2.png)'
						, 'background-position': -1*(tileXY[0]*this.args.blockSize)
							+ 'px '
							+ -1*(tileXY[1]*this.args.blockSize)
							+ 'px'
						, position: 'absolute'
						, left: 0
						, top: 0
					});

					this.blocks.add(block);
				}

				block.style({
					'background-position': -1*(tileXY[0]*this.args.blockSize)
						+ 'px '
						+ -1*(tileXY[1]*this.args.blockSize)
						+ 'px'
				});
			}
		}

		this.tags.viewport.style({
			'--x': Math.round(this.args.x)
			, '--y': Math.round(this.args.y)
			, '--xMod': Math.round(this.args.x % this.args.blockSize)
			, '--yMod': Math.round(this.args.y % this.args.blockSize)
			, '--width': this.args.width
			, '--height': this.args.height
		});
	}

	screenBox()
	{
		return [
			this.camera.x   - Math.floor(this.width/2)
			, this.camera.y - Math.floor(this.height/2)
			, this.camera.x + Math.ceil(this.width/2)
			, this.camera.y + Math.ceil(this.height/2)
		];
	}

	padConnected(event)
	{
		this.gamepad = event.gamepad;
	}
}
