import { PointActor } from './PointActor';

export class Switch extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-switch';

		this.args.width  = 32;
		this.args.height = 10;

		// this.args.float  = -1;

		this.removeTimer = null;

		this.args.active = false;

		this.activator = null;

		this.args.bindTo('active', v => {
			this.box && this.box.setAttribute('data-active', v ? 'true' : 'false');
		});

		this.ignore = 0;
	}

	update()
	{
		super.update();

		if(this.ignore > 0)
		{
			this.ignore--;

			return;
		}

		if(!this.activator || this.activator.args.standingOn !== this)
		{
			this.args.active = false;
			this.activator   = null;
		}
	}

	onAttached()
	{
		this.box = this.findTag('div');

		this.sample = new Audio('/Sonic/switch-activated.wav');
	}

	collideA(other, type)
	{
		if(this.activator)
		{
			this.ignore = 8;
		}

		if(other.public.ySpeed < 0)
		{
			if(other.public.ySpeed === 0 && other.y > this.y )
			{
				return true;
			}

			return false;
		}

		if(this.public.active && other.y < this.y)
		{
			return true;
		}

		if(other.isEffect || other.isRegion)
		{
			return;
		}

		other.onRemove(()=> this.activator = null);

		if(other.y < this.y)
		{
			if(!this.public.active)
			{
				this.activate();
			}

			this.ignore = 8;

			this.args.active = true;

			this.activator = other;

			if(type === 1 || type === 3)
			{
				return false;
			}

			return true;
		}

		return false;
	}

	activate()
	{
		this.beep();

		if(this.args.destroyLayer)
		{
			const layerId = this.args.destroyLayer;
			const layer   = this.viewport.args.layers[ layerId ];

			layer.args.destroyed = true;
		}

		if(this.args.water)
		{
			const water = this.viewport.actorsById[ this.args.water ];
			const level = this.viewport.objDefs.get( this.args.setPoint );

			water.target = Number(water.y || 0) - Number(level.y || 0);

			water.args.fillSpeed  = this.args.fillSpeed  ?? water.args.fillSpeed;
			water.args.drainSpeed = this.args.drainSpeed ?? water.args.drainSpeed;
		}

		const spawnPoint = this.viewport.objDefs.get(this.args.point);
		const spawnType  = this.viewport.objectPalette[ this.args.spawn ];

		if(spawnType && spawnPoint)
		{
			this.viewport.spawn.add({object: new spawnType({x:spawnPoint.x,y:spawnPoint.y})});
		}

		this.args.active = true;
	}

	beep()
	{
		if(this.viewport.args.audio && this.sample)
		{
			this.sample.play();
		}
	}

	get solid() { return true; }
}
