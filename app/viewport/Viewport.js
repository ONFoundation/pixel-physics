import { Bindable } from 'curvature/base/Bindable';
import { Bag  } from 'curvature/base/Bag';
import { Tag  } from 'curvature/base/Tag';
import { View } from 'curvature/base/View';

import { Keyboard } from 'curvature/input/Keyboard';

// import { Actor   } from '../actor/Actor';
import { TileMap } from '../tileMap/TileMap';

import { Backdrop } from './Backdrop';

import { QuestionBlock } from '../actor/QuestionBlock';
import { BrokenMonitor } from '../actor/BrokenMonitor';
import { MarbleBlock } from '../actor/MarbleBlock';
import { LayerSwitch } from '../actor/LayerSwitch';

import { Explosion } from '../actor/Explosion';
import { StarPost } from '../actor/StarPost';
import { Emerald } from '../actor/Emerald';
import { Window } from '../actor/Window';
import { Monitor } from '../actor/Monitor';
import { Spring } from '../actor/Spring';
import { Ring } from '../actor/Ring';
import { Coin } from '../actor/Coin';

import { WaterJet } from '../actor/WaterJet';
import { WaterFall } from '../actor/WaterFall';

import { PowerupGlow } from '../actor/PowerupGlow';
import { SuperRing } from '../actor/SuperRing';

import { PointActor } from '../actor/PointActor';

import { Projectile } from '../actor/Projectile';
import { TextActor } from '../actor/TextActor';

import { EggMobile } from '../actor/EggMobile';
import { DrillCar } from '../actor/DrillCar';
import { Tornado } from '../actor/Tornado';

import { NuclearSuperball } from '../actor/NuclearSuperball';

import { Eggman     } from '../actor/Eggman';
import { Eggrobo     } from '../actor/Eggrobo';
import { MechaSonic } from '../actor/MechaSonic';

import { Sonic }      from '../actor/Sonic';
import { Tails }      from '../actor/Tails';
import { Knuckles }   from '../actor/Knuckles';

import { Seymour }   from '../actor/Seymour';

import { Rocks }   from '../actor/Rocks';
import { Switch }   from '../actor/Switch';

import { Region }   from '../actor/Region';

import { WaterRegion }   from '../actor/WaterRegion';
import { ShadeRegion }   from '../region/ShadeRegion';

import { CharacterString } from '../ui/CharacterString';
import { HudFrame } from '../ui/HudFrame';

import { Layer } from './Layer';

import { Controller } from '../controller/Controller';

const objectPalette = {
	player:           NuclearSuperball
	, spring:         Spring
	, 'layer-switch': LayerSwitch
	, 'star-post':    StarPost
	, 'q-block':      QuestionBlock
	, 'projectile':   Projectile
	, 'marble-block': MarbleBlock
	, 'drill-car':    DrillCar
	, 'tornado':      Tornado
	, 'egg-mobile':   EggMobile
	, 'rocks-tall':   Rocks
	, 'rocks-med':    Rocks
	, 'rocks-short':  Rocks
	, 'mecha-sonic':  MechaSonic
	, 'sonic':        Sonic
	, 'tails':        Tails
	, 'knuckles':     Knuckles
	, 'eggman':       Eggman
	, 'eggrobo':      Eggrobo
	, 'seymour':      Seymour
	, 'switch':       Switch
	, 'window':       Window
	, 'emerald':      Emerald
	, 'region':       WaterRegion
	, 'shade-region': ShadeRegion
	, 'ring':         Ring
	, 'super-ring':   SuperRing
	, 'coin':         Coin
	, 'powerup-glow': PowerupGlow
	, 'explosion':    Explosion
	, 'text-actor':   TextActor
	, 'water-jet':    WaterJet
	, 'water-fall':   WaterFall
};

const ColCellsNear = Symbol('collision-cells-near');
const ColCell = Symbol('collision-cell');

export class Viewport extends View
{
	template  = require('./viewport.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.screenFilter = 'runners';

		// this.hud = new Hud
		this.sprites = new Bag;
		this.world   = null;

		Object.defineProperty(this, 'tileMap', {value: new TileMap});

		this.particles = new Bag;
		this.effects   = new Bag;

		this.args.particles = this.particles.list;
		this.args.effects   = this.effects.list;

		this.args.maxFps    = 60;

		this.args.currentActor = '';

		this.args.yOffsetTarget = 0.75;
		this.args.yOffset = 0.5;

		this.args.topLine = new CharacterString({value:'', scale: 2});
		this.args.status  = new CharacterString({value:'', scale: 2});
		this.args.focusMe = new CharacterString({value:'', scale: 2});

		this.args.labelChar = new CharacterString({value:'Char: '});

		this.args.labelX = new CharacterString({value:'x pos: '});
		this.args.labelY = new CharacterString({value:'y pos: '});

		this.args.labelGround = new CharacterString({value:'Grounded: '});
		this.args.labelAngle  = new CharacterString({value:'Gnd theta: '});
		this.args.labelGSpeed = new CharacterString({value:'speed: '});
		this.args.labelXSpeed = new CharacterString({value:'X air spd: '});
		this.args.labelYSpeed = new CharacterString({value:'Y air spd: '});
		this.args.labelMode   = new CharacterString({value:'Mode: '});
		this.args.labelFrame  = new CharacterString({value:'Frame ID: '});
		this.args.labelFps    = new CharacterString({value:'FPS: '});

		this.args.labelAirAngle  = new CharacterString({value:'Air theta: '});

		this.args.char   = new CharacterString({value:'...'});

		this.args.xPos   = new CharacterString({value:0});
		this.args.yPos   = new CharacterString({value:0});
		this.args.gSpeed = new CharacterString({value:0, high: 199, med: 99, low: 49});
		this.args.ground = new CharacterString({value:''});
		this.args.xSpeed = new CharacterString({value:0});
		this.args.ySpeed = new CharacterString({value:0});
		this.args.mode   = new CharacterString({value:0});
		this.args.angle  = new CharacterString({value:0});

		this.args.airAngle  = new CharacterString({value:0});

		this.args.fpsSprite = new CharacterString({value:0});
		this.args.frame     = new CharacterString({value:0});

		// this.args.bindTo('frameId', v => this.args.frame.args.value = Number(v) );
		this.args.bindTo('fps', v => this.args.fpsSprite.args.value = Number(v).toFixed(2) );

		this.args.frameId = -1;

		this.rings = new CharacterString({value:0});
		this.coins = new CharacterString({value:0});
		this.emeralds = new CharacterString({value:'0/7'});

		this.args.emeralds = new HudFrame({value:this.emeralds, type: 'emerald-frame'});
		// this.args.timer = new HudFrame({value:new CharacterString({value:'00:00.000'})});
		this.args.rings = new HudFrame({value:this.rings, type: 'ring-frame'});
		this.args.coins = new HudFrame({value:this.coins, type: 'coin-frame'});

		this.controlCard = View.from(require('../cards/basic-controls.html'));
		this.moveCard    = View.from(require('../cards/basic-moves.html'));

		this.args.blockSize = 32;

		this.args.populated = false;

		this.args.willStick = false;
		this.args.stayStuck = false;

		this.args.willStick = true;
		this.args.stayStuck = true;

		this.args.width  = 32 * 14;
		this.args.height = 32 * 8;
		this.args.scale  = 2;

		// this.args.width  = 32 * 7;
		// this.args.height = 32 * 4;
		// this.args.scale  = 2;

		// this.args.width  = 32 * 14 * 2;
		// this.args.height = 32 * 8 * 2;
		// this.args.scale  = 1;

		this.collisions = new WeakMap;

		this.args.x = this.args.x || 0;
		this.args.y = this.args.y || 0;

		this.args.layers = [];

		this.args.animation = '';

		this.spawn   = new Set;
		this.regions = new Set;
		this.auras   = new Set;

		this.actorsById = {};

		this.playable = new Set;

		this.actors = new Bag((i,s,a) => {
			if(a == Bag.ITEM_ADDED)
			{
				i.viewport = this;

				this.setColCell(i);

				if(i instanceof Region)
				{
					this.regions.add(i);
				}

				if(i.controllable)
				{
					this.playable.add(i);
					// this.auras.add(i);
				}

				this.actorsById[i.args.id] = i;
			}
			else if(a == Bag.ITEM_REMOVED)
			{
				i.viewport = null;

				if(i[ColCell])
				{
					this.playable.delete(i);
					i[ColCell].delete(i);
				}

				if(i instanceof Region)
				{
					this.regions.delete(i);
				}

				this.auras.delete(i);

				delete i.controllable[i.args.name];
				delete this.actorsById[i.args.id];
				delete i[ColCell];
			}
		});

		this.blocks = new Bag;

		this.args.blocks = this.blocks.list;
		this.args.actors = this.actors.list;

		this.listen(window, 'gamepadconnected', event => this.padConnected(event));
		this.listen(window, 'gamepaddisconnected', event => this.padRemoved(event));

		this.colCellCache = {};
		this.colCellDiv = this.args.width > this.args.height
		 	? this.args.width * 0.75
		 	: this.args.height * 0.75;

		this.colCells   = {};

		this.actorPointCache = new Map;

		this.startTime = null;

		this.args.audio = true;

		this.nextControl = false;

		this.args.controllable = {};

		this.updateStarted = new Set;
		this.updateEnded = new Set;
		this.updated = new Set;

		this.args.xBlur = 0;
		this.args.yBlur = 0;

		this.args.controlCard = View.from(require('../cards/basic-controls.html'));
		this.args.controlCard = View.from(require('../cards/sonic-controls.html'));
		this.args.moveCard    = View.from(require('../cards/basic-moves.html'));

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.replayInputs = [];

		this.args.backdrop = new Backdrop({strips: [
			{
				autoscroll:  -1
				, parallax:  0
				, url:       '/Sonic/backdrop/marble-garden/1.png'
				, height:    24
			}
			, {
				autoscroll: -0.9
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/2.png'
				, height:   8
			}
			, {
				autoscroll: -0.8
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/3.png'
				, height:   24
			}
			, {
				autoscroll: -0.7
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/4.png'
				, height:   8
			}
			, {
				autoscroll: -0.6
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/5.png'
				, height:   24
			}
			, {
				autoscroll: -0.5
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/6.png'
				, height:   16
			}
			, {
				autoscroll: -0.45
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/7.png'
				, height:   8
			}
			, {
				autoscroll: -0.45
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/8.png'
				, height:   16
			}
			, {
				autoscroll: -0.4
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/9.png'
				, height:   8
			}
			, {
				autoscroll: -0.35
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/10.png'
				, height:   16
			}
			, {
				autoscroll: -0.3
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/11.png'
				, height:   8
			}
			, {
				autoscroll: -0.25
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/12.png'
				, height:   8
			}
			, {
				autoscroll: -0.2
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/13.png'
				, height:   8
			}
			, {
				autoscroll: -0.15
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/14.png'
				, height:   8
			}
			, {
				autoscroll: -0.1
				, parallax: 0
				, url:      '/Sonic/backdrop/marble-garden/15.png'
				, height:   5
			}
			, {
				autoscroll: 0
				, parallax: 0.1
				, url:      '/Sonic/backdrop/marble-garden/16.png'
				, height:   43
			}
			, {
				autoscroll: 0
				, parallax: 0.125
				, url:      '/Sonic/backdrop/marble-garden/17.png'
				, height:   12
			}
			, {
				autoscroll: 0
				, parallax: 0.15
				, url:      '/Sonic/backdrop/marble-garden/18.png'
				, height:   6
			}
			, {
				autoscroll: 0
				, parallax: 0.175
				, url:      '/Sonic/backdrop/marble-garden/19.png'
				, height:   6
			}
			, {
				autoscroll: 0
				, parallax: 0.2
				, url:      '/Sonic/backdrop/marble-garden/20.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.225
				, url:      '/Sonic/backdrop/marble-garden/21.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.25
				, url:      '/Sonic/backdrop/marble-garden/22.png'
				, height:   24
			}
			, {
				autoscroll: 0
				, parallax: 0.35
				, url:      '/Sonic/backdrop/marble-garden/23.png'
				, height:   344
			}
		]});
		// this.replayInputs = JSON.parse(localStorage.getItem('replay')) || [];
	}

	fullscreen()
	{
		this.args.focusMe.args.hide = 'hide';

		this.initScale = this.args.scale;

		this.tags.viewport.requestFullscreen().then(res=>{
			this.onTimeout(100, ()=>{

				const hScale = window.innerHeight / this.args.height;
				const vScale = window.innerWidth / this.args.width;

				this.args.scale = hScale > vScale ? hScale : vScale;
				this.args.fullscreen = 'fullscreen';

				this.args.status.args.value = ' hit escape to revert. ';

				this.args.status.args.hide  = '';

				this.onTimeout(2500, ()=>{
					this.args.focusMe.args.hide = '';
					this.args.status.args.hide  = 'hide';
					this.tags.viewport.focus();
				});
			});
		});
	}

	onAttached(event)
	{
		this.tags.blurDistance.setAttribute('style', `filter:url(#motionBlur)`);

		this.listen(document, 'fullscreenchange', (event) => {
			if (!document.fullscreenElement)
			{
				this.args.scale = this.initScale;
				this.args.fullscreen = ''
			}
		});

		this.tags.frame.style({
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});

		this.update();

		if(!this.startTime)
		{
			this.startTime = Date.now() + 4.75 * 1000;
		}

		this.args.paused = true;

		this.args.status.args.hide = 'hide';

		this.args.animation = 'start';

		this.onTimeout(250, () => {

			this.args.animation = '';

			this.onTimeout(750, () => {
				this.args.animation = 'opening';
				this.tags.viewport.focus();

				this.onTimeout(750, () => {
					this.args.animation = 'opening2';
					this.tags.viewport.focus();

					this.update();

					this.onTimeout(1500, () => {
						this.args.animation = 'closing';
						this.tags.viewport.focus();

						this.args.focusMe.args.value = ' Click here to enable keyboard control. ';
						this.args.status.args.hide = '';

						this.onTimeout(750, () => {
							this.args.animation = 'closed';
							this.tags.viewport.focus();
						});

						this.onTimeout(500, () => {
							this.args.paused = false;
							this.tags.viewport.focus();
							this.startTime = Date.now();
						});
					});
				});
			});
		});

		this.listen(document.body, 'click', event => {

			if(event.target !== document.body)
			{
				return;
			}

			this.tags.viewport.focus()
		});

		this.args.scale = this.args.scale || 1;

		const keyboard = Keyboard.get();

		keyboard.listening = true

		keyboard.focusElement = this.tags.viewport.node;
	}

	takeInput(controller)
	{
		const keyboard = Keyboard.get();

		keyboard.update();

		if(controller && controller.buttons[16] && controller.buttons[16].time === 2)
		{
			this.playableIterator = this.playableIterator || this.playable.entries();

			let next = this.playableIterator.next();

			if(next.done)
			{
				this.playableIterator = false;

				this.playableIterator = this.playable.entries();

				next = this.playableIterator.next();

			}

			if(next.value)
			{
				this.nextControl = next.value[0];

				controller.update();

				return;
			}
		}

		if(controller && controller.buttons[9] && controller.buttons[9].time === 2)
		{
			this.args.paused = !this.args.paused;

			controller.update();

			return;
		}

		if(controller && !this.gamepad)
		{
			controller.readInput({keyboard});
		}
		else
		{
			const gamepads = navigator.getGamepads();

			for(let i = 0; i < gamepads.length; i++)
			{
				const gamepad = gamepads.item(i);

				if(!gamepad)
				{
					continue;
				}

				controller && controller.readInput({keyboard, gamepad});

				if(gamepad)
				{
					const gamepadId = String(gamepad.id);

					if(gamepadId.match(/xbox/i))
					{
						this.args.inputName = 'xbox controller & keyboard';

						this.args.inputType = 'input-xbox';
					}
					else
					{
						this.args.inputName = 'playstation controller & keyboard';

						this.args.inputType = 'input-playstation';
					}

				}
				else
				{
					this.args.inputName = 'keyboard';

					this.args.inputType = '';
				}

			}

		}

		if(this.args.isRecording)
		{
			const frame = this.args.frameId;
			const input = controller.serialize();
			const args  = {
				[this.controlActor.public.id]: {
					x: this.controlActor.public.x
					, y: this.controlActor.public.y
					, gSpeed: this.controlActor.public.gSpeed
					, xSpeed: this.controlActor.public.xSpeed
					, ySpeed: this.controlActor.public.ySpeed
				}
			};

			this.replayInputs.push({frame, input, args});
		}

		controller && controller.update();
	}

	moveCamera()
	{
		if(!this.controlActor)
		{
			return;
		}

		let cameraSpeed = 15;

		if(this.controlActor.args.falling)
		{
			this.args.yOffsetTarget = 0.5;
			cameraSpeed = 25;

		}
		else if(this.controlActor.args.mode === 2)
		{
			this.args.yOffsetTarget = 0.25;
			cameraSpeed = 10;
			// if(this.controlActor.args.cameraMode == 'normal')
			// {
			// 	this.args.yOffsetTarget = 0.25;
			// 	cameraSpeed = 10;
			// }
			// else
			// {
			// 	this.args.yOffsetTarget = 0.5;
			// 	cameraSpeed = 10;
			// }
		}
		else if(this.controlActor.args.mode)
		{
			this.args.yOffsetTarget = 0.5;
		}
		else if(this.controlActor.args.cameraMode == 'normal')
		{
			this.args.yOffsetTarget = 0.75;
			cameraSpeed = 10;
		}
		else
		{
			this.args.yOffsetTarget = 0.5;
			cameraSpeed = 20;
		}

		const xNext = -this.controlActor.x + this.args.width  * 0.5;
		const yNext = -this.controlActor.y + this.args.height * this.args.yOffset;

		this.args.x = xNext;
		this.args.y = yNext;

		if(Math.abs(this.args.yOffsetTarget - this.args.yOffset) < 0.01)
		{
			this.args.yOffset = this.args.yOffsetTarget
		}
		else
		{
			this.args.yOffset += ((this.args.yOffsetTarget - this.args.yOffset) / cameraSpeed);
		}

		if(this.args.x > 96)
		{
			this.args.x = 96;
		}

		if(this.args.y > 96)
		{
			this.args.y = 96;
		}

		const xMax = -(this.tileMap.mapData.width * 32) + this.args.width - 96;
		const yMax = -(this.tileMap.mapData.height * 32) + this.args.height - 96;

		if(this.args.x < xMax)
		{
			this.args.x = xMax;
		}

		if(this.args.y < yMax)
		{
			this.args.y = yMax;
		}
	}

	updateBackground()
	{
		const layers = this.tileMap.tileLayers;
		const layerCount = layers.length;

		let controlActor = this.controlActor;

		if(controlActor && controlActor.standingOn && controlActor.standingOn.isVehicle)
		{
			controlActor = this.controlActor.standingOn;
		}

		if(controlActor && this.tags.blur)
		{
			let xBlur = (Number(((controlActor.x - this.xPrev) * 100) / 500) ** 2).toFixed(2);
			let yBlur = (Number(((controlActor.y - this.yPrev) * 100) / 500) ** 2).toFixed(2);

			let blurAngle = Number(controlActor.realAngle + Math.PI).toFixed(2);

			const maxBlur = 32;

			xBlur = xBlur < maxBlur ? xBlur : maxBlur;
			yBlur = yBlur < maxBlur ? yBlur : maxBlur;

			let blur = (Math.sqrt(xBlur**2 + yBlur**2) / 4).toFixed(2);

			if(blur > 1)
			{
				if(controlActor.public.falling)
				{
					blurAngle = Math.atan2(controlActor.public.ySpeed, controlActor.public.xSpeed);
				}

				this.tags.blurAngle.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
				this.tags.blur.setAttribute('stdDeviation', `${(blur * 0.75) - 1}, 0`);
			}
			else
			{
				blurAngle = 0;
				blur = 0;

				this.tags.blurAngle.setAttribute('style', `transform:rotate(calc(1rad * ${blurAngle}))`);
				this.tags.blurAngleCancel.setAttribute('style', `transform:rotate(calc(-1rad * ${blurAngle}))`);
				this.tags.blur.setAttribute('stdDeviation', `${blur}, 0`);
			}

			this.xPrev = controlActor.x;
			this.yPrev = controlActor.y;
		}

		for(let i = 0; i < layerCount; i++)
		{
			if(!this.args.layers[i])
			{
				this.args.layers[i] = new Layer({
					layerId: i
					, viewport: this
					, name: layers[i].name
				});

				this.args.layers[i].args.height = this.args.height;
				this.args.layers[i].args.width  = this.args.width;
			}

			const xDir = Math.sign(this.args.layers[i].x - this.args.x);
			const yDir = Math.sign(this.args.layers[i].y = this.args.y);

			this.args.layers[i].x = this.args.x;
			this.args.layers[i].y = this.args.y;

			this.args.layers[i].update(this.tileMap, xDir, yDir);
		}

		const xMax = -(this.tileMap.mapData.width * 32);
		const yMax = -(this.tileMap.mapData.height * 32);

		this.tags.bgFilters.style({'--x': Math.round(this.args.x), '--y': Math.round(this.args.y)});
		this.tags.fgFilters.style({'--x': Math.round(this.args.x), '--y': Math.round(this.args.y)});

		this.tags.content.style({'--x': Math.round(this.args.x), '--y': Math.round(this.args.y)});

		Object.assign(this.args.backdrop.args, ({
			'x': Math.round(this.args.x)
			, 'y': Math.round(this.args.y)
			, 'xMax': xMax
			, 'yMax': yMax
			, 'frame': this.args.frameId
		}));

		const xMod = this.args.x < 0
			? Math.round(this.args.x % (this.args.blockSize))
			: (-this.args.blockSize + Math.round(this.args.x % this.args.blockSize)) % this.args.blockSize;

		const yMod = this.args.y < 0
			? Math.round(this.args.y % (this.args.blockSize))
			: (-this.args.blockSize + Math.round(this.args.y % this.args.blockSize)) % this.args.blockSize;

		this.tags.background.style({transform: `translate( ${xMod}px, ${yMod}px )`});

		this.tags.frame.style({
			'--width': this.args.width
			, '--height': this.args.height
			, '--scale': this.args.scale
		});
	}

	populateMap()
	{
		if(this.args.populated)
		{
			return;
		}

		this.args.populated = true;

		const objDefs = this.tileMap.getObjectDefs();

		for(let i in objDefs)
		{
			const objDef  = objDefs[i];
			const objType = objDef.type;

			if(!objectPalette[objType])
			{
				continue;
			}

			const objClass = objectPalette[objType];

			const actor = Bindable.make(objClass.fromDef(objDef));

			// if(!actor.controllable)
			// {
			// 	continue;
			// }

			this.actors.add( actor );

			const width  = this.args.width;
			const height = this.args.height;
			const margin = 32;

			const camLeft   = -this.args.x + -16 + -margin;
			const camRight  = -this.args.x + width + -16 + margin;

			const camTop    = -this.args.y;
			const camBottom = -this.args.y + height;

			const actorTop   = actor.y - actor.public.height;
			const actorRight = actor.x + actor.public.width;
			const actorLeft  = actor.x;

			if(camLeft < actorRight && camRight > actorLeft
				&& camBottom > actorTop && camTop < actor.y
			){
				actor.args.display = 'initial';
			}
			else
			{
				actor.args.display = 'none';
			}

			if(actor.controllable)
			{
				this.args.controllable[ objDef.name ] = actor;

				// this.auras.add( actor );

				actor.args.display = 'initial';
			}
		}
	}

	spawnActors()
	{
		for(const spawn of this.spawn.values())
		{
			if(spawn.frame <= this.args.frameId)
			{
				this.spawn.delete(spawn);

				this.actors.add(Bindable.make(spawn.object));
			}
		}
	}

	actorUpdateStart(nearbyCells)
	{
		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				if(this.updateStarted.has(actor))
				{
					continue;
				}

				actor.updateStart();

				this.updateStarted.add(actor);
			}
		}
	}

	actorUpdate(nearbyCells)
	{
		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				if(this.updated.has(actor))
				{
					continue;
				}

				actor.update();

				this.setColCell(actor);

				this.updated.add(actor);
			}
		}
	}

	actorUpdateEnd(nearbyCells)
	{
		const width  = this.args.width;
		const height = this.args.height;
		const x = this.args.x;
		const y = this.args.y;

		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				if(this.updateEnded.has(actor))
				{
					continue;
				}

				actor.updateEnd();

				this.updateEnded.add(actor);
			}
		}
	}

	nearbyActors(actor)
	{
		const nearbyCells = this.getNearbyColCells(actor);

		const width  = this.args.width;
		const height = this.args.height;
		const x = this.args.x;
		const y = this.args.y;

		const result = new Set;

		for(const i in nearbyCells)
		{
			const cell   = nearbyCells[i];
			const actors = cell.values();

			for(const actor of actors)
			{
				result.add(actor);
			}
		}

		return result;
	}

	update()
	{
		const time  = (Date.now() - this.startTime) / 1000;
		let minutes = String(Math.floor(Math.abs(time) / 60)).padStart(2,'0')
		let seconds = String((Math.abs(time) % 60).toFixed(2)).padStart(5,'0');

		const neg = time < 0 ? '-' : '';

		if(neg)
		{
			minutes = Number(minutes);
		}

		if(!this.args.populated)
		{
			this.populateMap();
		}

		// this.args.timer.args.value.args.value = `${neg}${minutes}:${seconds}`;

		this.args.rippleFrame = this.args.frameId % 128;

		this.actorPointCache.clear();

		if(this.args.paused)
		{
			this.tags.frame.style({
				'--scale':   this.args.scale
				, '--width': this.args.width
			});

			if(this.controlActor && this.controlActor.controller)
			{
				this.takeInput(this.controlActor.controller);
			}

			return;
		}

		this.args.frameId++;

		this.args.displaceWater = this.args.frameId % 128;

		const actorThree = this.actorsById[3];

		if(this.controlActor)
		{
			if(this.args.isReplaying)
			{
				this.args.focusMe.args.hide = 'hide';

				const replay = this.replayInputs[this.args.frameId];

				if(replay && replay.actors)
				{
					for(const actorId in replay.actors)
					{
						const actor = this.actorsById[actorId];
						const frame = replay.actors[actorId];

						if(frame.input)
						{
							actor.controller.replay(frame.input);
							actor.readInput();
						}

						if(frame.args)
						{
							Object.assign(actor.args, frame.args);
						}
					}

					if(this.replayInputs.length)
					{
						this.args.hasRecording = true;
						this.args.topLine.args.value = ' i cant believe its not canvas. ';
						this.args.status.args.value = ' click here to exit demo. ';
					}
				}
				else
				{
					this.args.status.args.hide = 'hide';
					this.args.isReplaying = false;
				}
			}

			if(!this.args.isReplaying || this.controlActor !== actorThree)
			{
				this.args.focusMe.args.hide = '';

				this.takeInput(this.controlActor.controller);
				this.controlActor.readInput();
			}

			// if(!this.args.maxSpeed)
			// {
			// 	this.args.maxSpeed = this.controlActor.args.gSpeedMax;
			// }

			// this.controlActor.args.gSpeedMax = this.args.maxSpeed;

			// this.controlActor.willStick = !!this.args.willStick;
			// this.controlActor.stayStuck = !!this.args.stayStuck;

			this.controlActor.crawling = false;
			this.controlActor.running  = false;
		}
		else
		{
			const actors = this.actors.list;

			this.nextControl = this.nextControl || actors[0];
		}

		this.updateStarted.clear();
		this.updated.clear();
		this.updateEnded.clear();

		this.updateBackground();

		for(const region of this.regions.values())
		{
			region.updateStart();
			this.updateStarted.add(region);

			region.update();
			this.updated.add(region);
		}

		const actorCells = new WeakMap;

		for(const actor of this.auras.values())
		{
			const nearbyCells = this.getNearbyColCells(actor);

			actorCells.set(actor, nearbyCells);

			if(this.updateStarted.has(actor))
			{
				continue;
			}

			actor.updateStart();

			this.updateStarted.add(actor);

			this.actorUpdateStart(nearbyCells);
		}

		for(const actor of this.auras.values())
		{
			const nearbyCells = actorCells.get(actor);

			if(this.updated.has(actor))
			{
				continue;
			}

			actor.update();

			this.updated.add(actor);

			this.actorUpdate(nearbyCells);
		}

		if(this.controlActor)
		{
			this.rings.args.value = this.controlActor.args.rings;
			this.coins.args.value = this.controlActor.args.coins;
			this.emeralds.args.value = `${this.controlActor.args.emeralds}/7`;

			this.args.hasRings    = !!this.controlActor.args.rings;
			this.args.hasCoins    = !!this.controlActor.args.coins;
			this.args.hasEmeralds = !!this.controlActor.args.emeralds;

			this.args.char.args.value = this.controlActor.args.name;
			this.args.charName        = this.controlActor.args.name;

			this.args.xPos.args.value     = Math.round(this.controlActor.x);
			this.args.yPos.args.value     = Math.round(this.controlActor.y);

			// this.args.ground.args.value   = this.controlActor.args.landed;
			// this.args.gSpeed.args.value   = this.controlActor.args.gSpeed.toFixed(2);
			// this.args.xSpeed.args.value   = Math.round(this.controlActor.args.xSpeed);
			// this.args.ySpeed.args.value   = Math.round(this.controlActor.args.ySpeed);
			// this.args.angle.args.value    = (Math.round((this.controlActor.args.groundAngle) * 1000) / 1000).toFixed(3);
			// this.args.airAngle.args.value = (Math.round((this.controlActor.args.airAngle) * 1000) / 1000).toFixed(3);

			const modes = ['FLOOR', 'L-WALL', 'CEILING', 'R-WALL'];

			this.args.mode.args.value = modes[Math.floor(this.controlActor.args.mode)] || Math.floor(this.controlActor.args.mode);
		}

		for(const actor of this.auras.values())
		{
			const nearbyCells = actorCells.get(actor);

			if(!this.updateEnded.has(actor))
			{
				actor.updateEnd();

				this.updateEnded.add(actor);

				this.actorUpdateEnd(nearbyCells);
			}
		}

		for(const region of this.regions.values())
		{
			if(!this.updateEnded.has(region))
			{
				region.updateEnd();
				this.updateEnded.add(region);
			}
		}

		const width  = this.args.width;
		const height = this.args.height;
		const margin = 32;

		const camLeft   = -this.args.x + -16 + -margin;
		const camRight  = -this.args.x + width + -16 + margin;

		const camTop    = -this.args.y;
		const camBottom = -this.args.y + height;

		const inAuras = new WeakSet;

		if(this.controlActor)
		{
			if(this.visibilityTimer)
			{
				clearTimeout(this.visibilityTimer);
				this.visibilityTimer = false;
			}

			this.visibilityTimer = setTimeout(()=>{

				this.visibilityTimer = false;

				for(const i in this.actors.list)
				{
					const actor = this.actors.list[i];

					if(!this.auras.has(actor))
					{
						const actorBottom = actor.y + 64;
						const actorTop    = actor.y - actor.public.height - 64;
						const actorRight  = actor.x + actor.public.width  + 64;
						const actorLeft   = actor.x - actor.public.width  - 64;

						if(inAuras.has(actor))
						{
							continue;
						}

						if(camLeft < actorRight
							&& camRight > actorLeft
							&& camBottom > actorTop
							&& camTop < actorBottom
							&& !(actor instanceof LayerSwitch)
						){
							actor.args.display = 'initial';

							if(!actor.vizi)
							{
								actor.nodes.map(n => this.tags.actors.append(n));

								actor.vizi = true;
							}

							inAuras.add(actor);
						}
						else
						{
							// actor.args.display = 'none';

							actor.nodes.map(n => n.remove());

							actor.vizi = false;

						}
					}
				}
			}, 0);
		}

		this.spawnActors();

		if(this.nextControl)
		{
			this.auras.delete(this.controlActor);

			this.controlActor = this.nextControl;

			this.auras.add(this.controlActor);

			this.controlActor.args.display = 'initial';

			this.controlActor.nodes.map(n => this.tags.actors.append(n));

			this.controlActor.vizi = true;

			this.args.maxSpeed = null;
			this.nextControl   = null;
		}

		if(this.controlActor && this.controlActor.controlCard)
		{
			if(this.controlActor.public.falling)
			{
				this.args.controlCard = this.controlActor.airControlCard;
			}
			else
			{
				this.args.controlCard = this.controlActor.controlCard;
			}
		}
		else
		{
			this.args.controlCard = this.controlCard;
		}

		if(this.controlActor)
		{
			this.moveCamera();
		}

		this.args.moveCard = this.moveCard;

		this.collisions = new WeakMap;
	}

	click(event)
	{
		this.args.topLine.args.hide = 'hide';
		this.args.status.args.hide  = 'hide';

		if(this.args.isReplaying)
		{
			this.controlActor.controller.zero();
			this.stop();
		}
	}

	regionAtPoint(x, y)
	{
		for(const region of this.regions.values())
		{
			const regionArgs = region.public;

			const regionX = regionArgs.x;
			const regionY = regionArgs.y;

			const width  = regionArgs.width;
			const height = regionArgs.height;

			const offset = Math.floor(width / 2);

			const left   = regionX;
			const right  = regionX + width;

			const top    = regionY - height;
			const bottom = regionY;

			if(x >= left && right > x)
			{
				if(bottom >= y && y > top)
				{
					return region;
				}
			}
		}
	}

	actorsAtPoint(x, y)
	{
		const cacheKey = [x,y].join('::');
		const actorPointCache = this.actorPointCache;

		if(actorPointCache.has(cacheKey))
		{
			return actorPointCache.get(cacheKey);
		}

		const actors = [];

		this.getNearbyColCells({x,y}).map(cell => {

			for(const actor of cell.values())
			{
				if(actor.removed)
				{
					// cell.delete(actor);
					continue;
				}

				const actorArgs = actor.public;

				const actorX = actorArgs.x;
				const actorY = actorArgs.y;

				const width  = actorArgs.width;
				const height = actorArgs.height;

				const offset = Math.floor(width / 2);

				const left   = -offset + actorX;
				const right  = -offset + actorX + width;

				const top    = actorY - height;
				const bottom = actorY;

				if(x >= left && right > x)
				{
					if(bottom >= y && y > top)
					{
						actors.push( actor );
					}
				}
			}

		});

		actorPointCache.set(cacheKey, actors);

		return actors;
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

	padRemoved(event)
	{
		if(!this.gamepad)
		{
			return;
		}

		if(this.gamepad.index === event.gamepad.index)
		{
			this.gamepad = null;
		}
	}

	getColCell(actor)
	{
		const colCellDiv = this.colCellDiv;
		const colCells   = this.colCells;

		const cellX = Math.floor( actor.x / colCellDiv );
		const cellY = Math.floor( actor.y / colCellDiv );

		colCells[cellX] = colCells[cellX] || {};

		colCells[cellX][cellY] = colCells[cellX][cellY] || new Set;

		return colCells[cellX][cellY];
	}

	setColCell(actor)
	{
		actor = Bindable.make(actor);

		const cell = this.getColCell(actor);

		const originalCell = actor[ColCell];

		if(originalCell && originalCell !== cell)
		{
			originalCell.delete(actor);
		}

		actor[ColCell] = cell;

		actor[ColCell].add(actor);

		return cell;
	}

	getNearbyColCells(actor)
	{
		const actorX = actor.public ? actor.public.x : actor.x;
		const actorY = actor.public ? actor.public.y : actor.y;

		const colCellDiv = this.colCellDiv
		const cellX = Math.floor( actorX / colCellDiv );
		const cellY = Math.floor( actorY / colCellDiv );

		const name = `${cellX}::${cellY}`;

		let cache = this.colCellCache[name];

		if(cache)
		{
			return cache.filter(set=>set.size);
		}

		const space = colCellDiv;

		this.colCellCache[name] = cache = [
			  this.getColCell({x:actorX - space, y:actorY - space})
			, this.getColCell({x:actorX - space, y:actorY})
			, this.getColCell({x:actorX - space, y:actorY + space})

			, this.getColCell({x:actorX, y:actorY - space})
			, this.getColCell({x:actorX, y:actorY})
			, this.getColCell({x:actorX, y:actorY + space})

			, this.getColCell({x:actorX + space, y:actorY - space})
			, this.getColCell({x:actorX + space, y:actorY})
			, this.getColCell({x:actorX + space, y:actorY + space})
		]

		return cache.filter(set=>set.size);
	}

	change(event)
	{
		if(!event.target.value)
		{
			return;
		}

		if(!this.args.controllable[ event.target.value ])
		{
			return;
		}

		const actor = this.args.controllable[ event.target.value ];

		this.nextControl = actor;

		this.tags.viewport.focus();
	}

	screenFilter(filterName)
	{
		this.args.screenFilter = filterName;
	}

	reset()
	{
		this.stop();

		for(const i in this.actors.list)
		{
			const actor = this.actors.list[i];

			this.actors.remove(actor);
		}

		this.controlActor && this.actors.remove(this.controlActor);

		this.spawn.clear();
		this.actorPointCache.clear();

		this.args.isRecording = false;
		this.args.isReplaying = false;

		this.args.populated = false;
		this.controlActor   = null;
		this.args.frameId   = -1;

		this.populateMap();

		this.nextControl = Object.values(this.args.actors)[0];

		this.tags.viewport.focus();

		this.startTime = Date.now();
	}

	record()
	{
		this.reset();

		this.replayInputs = [];

		this.args.isRecording  = true;
		this.args.hasRecording = true;
	}

	playback()
	{
		this.reset();

		this.args.isReplaying = true;
	}

	stop()
	{
		this.args.isReplaying = false;

		if(this.args.isRecording)
		{
			const replay = JSON.stringify([...this.replayInputs]);

			localStorage.setItem('replay', replay);
		}

		this.args.isRecording = false;

		this.controlActor && this.controlActor.controller.zero();
	}
}
