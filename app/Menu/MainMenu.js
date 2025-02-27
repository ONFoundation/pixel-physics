import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';

import { Pinch } from '../effects/Pinch';
import { Droop } from '../effects/Droop';
import { Twist } from '../effects/Twist';

import { Menu } from './Menu';

import { SettingsMenu } from './SettingsMenu';

import { TileMap }  from '../tileMap/TileMap';

export class MainMenu extends Menu
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.cardName = 'main-menu';

		this.args.haveToken = false;

		this.args.joinGame  = false;
		this.args.hostGame  = false;
		this.args.copy      = 'copy';

		this.refreshConnection();

		this.args.items = {

			'Single Player': {

				available: 'available'

				, children: {

					'Pixel Hill Zone': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/pixel-hill-zone.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Sonic Control Tutorial': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/sonic-movement.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Tails Control Tutorial': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/tails-movement.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Knuckles Control Tutorial': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/knuckles-movement.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Light Dash Test': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/light-dash-test.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							this.parent.args.started = false;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Block Test': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/block-test.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							this.parent.args.started = false;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Vehicle Test': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/vehicle-test.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							this.parent.args.started = false;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Half Pipe Test': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/half-pipe-test.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							this.parent.args.started = false;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'Flickie Test': {
						callback: () => {
							const tileMap = new TileMap({ mapUrl: '/map/flickie-test.json' });

							this.parent.args.networked = false;
							this.parent.tileMap = tileMap;

							this.parent.args.started = false;

							tileMap.ready.then(() => {
								this.parent.startLevel();
								this.accept();
							});
						}
					}
					, 'locked': { available: 'unavailable' }
					, 'locked ': { available: 'unavailable' }
					, 'locked  ': { available: 'unavailable' }
				}


				// , callback: () => {
				// 	this.parent.args.networked = false;
				// 	this.remove()
				// }

			}

			, Settings: SettingsMenu(parent)

			, 'Direct Connect': {

				children: {

					'Host a game': {
						callback: () => {
							this.args.hostOutput = '';
							this.args.hostGame   = true;
							this.args.copy       = 'copy';
						}
					}

					, 'Join a game': {
						callback: () => {
							this.args.joinOutput = '';
							this.args.joinGame   = true;
							this.args.copy       = 'copy';

							this.client.offer().then(token => {
								const tokenString    = JSON.stringify(token);
								const encodedToken   = `s3ktp://request/${btoa(tokenString)}`;
								this.args.joinOutput = encodedToken;
								this.args.haveToken  = true;
							});
						}
					}

				}
			}
			, 'Connect To Server': {

				available: 'unavailable'
			}
		};

		this.bgm = new Audio('/Sonic/s3k-competition.mp3');

		this.bgm.volume = 0.5;

		this.onRemove(() => this.bgm.pause());

		this.bgm.loop = true;
	}

	clear()
	{
		this.args.input      = '';
		this.args.joinOutput = '';
		this.args.hostOutput = '';
	}

	input(controller)
	{
		super.input(controller);

		if(this.args.pinch)
		{
			const xAxis = (controller.axes[2] ? controller.axes[2].magnitude : 0);
			const yAxis = (controller.axes[3] ? controller.axes[3].magnitude : 0);

			let pressure = 0;

			if(controller.buttons[6])
			{
				pressure = 0.25 + controller.buttons[6].pressure - controller.buttons[7].pressure;
			}

			this.args.pinch.args.scale =  pressure * 256;

			this.args.pinch.args.dx = 64*1.618 * xAxis;
			this.args.pinch.args.dy = 64*1.000 * yAxis;
		}
	}

	disconnect()
	{
		this.clear();

		if(this.args.hostGame)
		{
			this.server.close();
		}
		else if(this.args.joinGame)
		{
			this.client.close();
		}

		this.args.connected = false;
		this.args.hostGame  = false;
		this.args.joinGame  = false;

		this.refreshConnection();
	}

	onRendered()
	{
		const debind = this.parent.args.bindTo('audio', (v) => {
			v ? this.onTimeout(500, () => this.bgm.play()) : this.bgm.pause();
		});

		super.onRendered(event);

		this.onRemove(debind);

		this.args.pinch = new Twist({
			id:'menu-twist', scale:  64, width: Math.floor(64 * 1.618), height: 64
		});

		this.args.pinch = new Pinch({
			id:'menu-pinch', scale:  64, width: Math.floor(64 * 1.618), height: 64
		});
	}

	back()
	{
		super.back();

		this.disconnect();
	}

	answer()
	{
		let offerString = this.args.input;

		const isEncoded = /^s3ktp:\/\/request\/(.+)/.exec(offerString);

		if(isEncoded)
		{
			offerString = atob(isEncoded[1]);
		}

		const offer = JSON.parse(offerString);

		const answer = this.server.answer(offer);

		answer.then(token => {
			const tokenString    = JSON.stringify(token);
			const encodedToken   = `s3ktp://accept/${btoa(tokenString)}`;
			this.args.hostOutput = encodedToken;
			this.args.haveToken  = true;
		});

		return answer;
	}

	acceptRtp()
	{
		let answerString = this.args.input;

		const isEncoded = /^s3ktp:\/\/accept\/(.+)/.exec(answerString);

		if(isEncoded)
		{
			answerString = atob(isEncoded[1]);
		}

		const answer = JSON.parse(answerString);

		this.client.accept(answer);
	}

	select()
	{
		if(this.args.hostGame)
		{
			this.tags.hostOutput.select();
		}
		else if(this.args.joinGame)
		{
			this.tags.joinOutput.select();
		}
	}

	copy()
	{
		if(this.args.hostGame)
		{
			if(!this.args.input)
			{
				return;
			}

			this.tags.hostOutput.select();
		}
		else if(this.args.joinGame)
		{
			if(!this.args.joinOutput)
			{
				return;
			}

			this.tags.joinOutput.select();
		}

		document.execCommand("copy");

		this.args.copy = 'copied!';
	}

	paste(event)
	{
		navigator.clipboard.readText().then(copied => {
			if(this.args.hostGame && copied.match(/^s3ktp:\/\/request\//))
			{
				this.args.input = copied;

				this.answer().then(token => {
					this.copy();
				});
			}

			if(this.args.joinGame && copied.match(/^s3ktp:\/\/accept\//))
			{
				this.args.input = copied;
				this.acceptRtp();
			}
		});
	}

	refreshConnection()
	{
		this.server = this.parent.getServer(true);
		this.client = this.parent.getClient(true);

		const server = this.server;
		const client = this.client;

		const onOpen  = event => {
			const tileMap = new TileMap({ mapUrl: '/map/pixel-hill-zone.json' });

			this.parent.args.networked = true;
			this.parent.tileMap = tileMap;

			tileMap.ready.then(() => {
				this.parent.startLevel();
				this.accept();
				console.log('Peer connection opened!');
			});
		};
		const onClose = event => this.disconnect();

		this.listen(server, 'open', onOpen);
		this.listen(server, 'close', onClose);

		this.listen(client, 'open', onOpen);
		this.listen(client, 'close', onClose);
	}

	play()
	{
		super.play();

		const done = this.done;

		done.then(() => this.onTimeout(250, () => this.remove()));

		return done;
	}
}
