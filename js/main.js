// useful global variables
const g = {
	mouseForce: 0,

	sqVis: opt.vision * opt.vision,

	mouse: {
		x: 0,
		y: 0,
		down: false,
		over: true,
		button: 0
	},

	explode: 0,
	explodePos: new V2D(),

        dropGoal: 0,
        dropGoalPos: new V2D(),

	nextFrame: false,

	width: window.innerWidth,
	height: window.innerHeight,

	sprites: {
		explode: (() => {
			let shape = new PIXI.Graphics();

			shape.clear();
			shape.beginFill(0x000000);
			shape.drawCircle(0, 0, 100);
			shape.endFill();

			return shape;
		})()
	},

	delta: 1,
	shapeMode: 1,

	bias: parseFloat(opt.rbias),
	noiseRange: (Math.PI / 80) * opt.noise,

	fpsA: [],
	fps: 60
};

// PIXI app
const app = new PIXI.Application({
	width: g.width,
	height: g.height,
	antialias: true,
	transparent: false,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: 0x161616
});

document.body.prepend(app.view);

let obstacles = new Obstacles(opt.wallPositions);
let goals = new Goals(obstacles);
let flock = new Flock(opt.boids, obstacles, goals);

function loop(delta) {
	g.delta = delta;

	g.mouseForce = max(
		(opt.maxSpeed *
			opt.maxForce *
			(opt.alignment + opt.cohesion + opt.separation + 1)) /
			16,
		0
	);
	g.sqVis = opt.vision * opt.vision;

	if (!opt.paused) {
                // I actually have no idea what units delta is in
                // going to assume 10th of a millisecond
                goals.update(delta*10);
		flock.update();
	} else if (g.nextFrame) {
                goals.update(delta*10);
		flock.update();
		g.nextFrame = false;
	}

	flock.draw();

	if (g.explode === 1) {
		app.stage.addChild(g.sprites.explode);
	}
	if (g.explode > 0.001) {
		let s = Math.sqrt(g.explode);
		g.sprites.explode.alpha = s;
		g.sprites.explode.scale.x = s;
		g.sprites.explode.scale.y = s;

		g.explode *= 0.9;
	} else if (g.explode !== 0) {
		app.stage.removeChild(g.sprites.explode);
		g.explode = 0;
	}

        if (g.dropGoal === 1) {
                const rndTag = getRandomIntInclusive(0, opt.numTags - 1);
                goals.addGoalAt(rndTag, g.dropGoalPos.x, g.dropGoalPos.y);
                g.dropGoal = 0;
        }

	if (opt.debug) {
		g.fpsA.push(60 / delta);
		g.fps = g.fpsA.reduce((a, v) => a + v, 0) / 10;
		if (g.fpsA.length >= 10) g.fpsA.shift();
		select("#fps").textContent = g.fps.toFixed(2);
	}

	app.render();
}

app.ticker.add(loop);
