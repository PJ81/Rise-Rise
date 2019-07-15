
const WIDTH = 320, HEIGHT = 600, FIELD = WIDTH >> 1;
const State = {STAY: 0, FLY: 1, BACK: 2, HERO: 3, DEAD: 4, ALIVE: 5},
      Dir = {RIGHT: 0, LEFT: 1},
      GameState = {START: 0, MENU: 1, PLAY: 2, EXPLOSION: 3};
const COLORS = [
    "DeepPink", "Gold", "HotPink", "LightSkyBlue", "OrangeRed", "RebeccaPurple",
    "SteelBlue", "YellowGreen", "DarkGreen", "CornflowerBlue", "DarkRed", "Crimson",
    "DeepSkyBlue", "Orange", "SaddleBrown"
];
const VALS = [.2, .3, .4, .6, .9, 1.5, 5, 10, 25];

class Game {
	constructor() {
		let canvas = document.createElement('canvas');
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
        canvas.addEventListener("contextmenu", (ev) => {
            ev.preventDefault();
            return false;
        });
        document.body.appendChild(canvas);

		this.ctx = canvas.getContext('2d');
		this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1 / 60;
        this.gameState = GameState.START;
        this.regions = [];

        this.createPtsRegions();
        this.resetRegions();

        this.explosion = new Explosion();

        Promise.all([
            this.player = new Player(),
            this.level = new Level()
		]).then(() => {
			this.loop(0);
		});

        canvas.addEventListener("mousedown", (ev) => {
            if(ev.button === 2 && this.player.state === State.STAY) {
                this.player.setState(State.BACK);
                this.resetRegions();
            } else {
                switch(this.gameState) {
                    case GameState.PLAY:
                        this.player.move();
                    break;
                    case GameState.MENU:
                        this.gameState = GameState.PLAY;
                    break;
                }
            }
        });

		this.loop = (time) => {
			this.accumulator += (time - this.lastTime) / 1000;
			while(this.accumulator > this.deltaTime) {
                this.accumulator -= this.deltaTime;
                this.moveFrame();
            }
            this.draw();
			this.lastTime = time;
			requestAnimationFrame(this.loop);
		}
    }

    resetRegions() {
        this.regIndex = this.oldIdx = -1;
    }

    createPtsRegions() {
        let st = HEIGHT - 180, s = 0;
        for(let z = 0; z < 9; z++) {
            st -= 45;
            this.regions.push({y:st, pt:VALS[s++]}); 
        }
    }

    calculatePoints() {
        let y = this.player.Y();
        for(let o = this.regions.length - 1; o > this.oldIdx; o--) {
            if(y < this.regions[o].y + 45) {
                if(this.oldIdx !== o) {
                    this.oldIdx = o;
                    this.regIndex = o;
                    return this.regions[o].pt;
                }
            }
        }
        return 0;
    }

    moveFrame() {
        switch(this.gameState) {
            case GameState.START:
                this.player.init();
                this.level.init();
                this.resetRegions();
                this.gameState = GameState.MENU;
            break;
            case GameState.MENU:
                // do menu
            break;
            case GameState.EXPLOSION:
                this.explosion.update(this.deltaTime)
                if(this.explosion.state === State.DEAD) {
                    this.gameState = GameState.START;
                }
            break;
            case GameState.PLAY:
                this.player.update(this.deltaTime);
                this.level.update(this.deltaTime);
                if(!this.player.heroMode) {
                    this.player.addScore(this.calculatePoints());
                }

                let r = this.player.getRect();
                if(!this.player.heroMode && this.level.checkCollision(r)) {
                    this.player.setState(State.DEAD);
                    this.explosion.start((r.l + r.r) >> 1, r.t);
                    this.gameState = GameState.EXPLOSION;
                }
            break;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        switch(this.gameState) {
            case GameState.MENU:
                this.drawMenu();
            break;
            case GameState.EXPLOSION:
                this.level.draw(this.ctx);
                this.explosion.draw(this.ctx);
            break;
            case GameState.PLAY:
                this.level.draw(this.ctx);
                this.player.draw(this.ctx);

                if(this.regIndex > -1) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${.08})`;
                    let r = this.regions[this.regIndex];
                    this.ctx.fillRect(80, r.y, 160, 45);
                }

                this.explosion.draw(this.ctx);
            break;
        }
    }

    drawMenu() {
        this.ctx.fillStyle = "#eee";
        this.ctx.textAlign = "center";
        this.ctx.font = "20px Revalia"; 

        let l = .18;
        this.ctx.fillText("Left click:", WIDTH >> 1, HEIGHT * l); l += .05;
        this.ctx.fillText("moves the space ship", WIDTH >> 1, HEIGHT * l); l += .07;
        this.ctx.fillText("Right click", WIDTH >> 1, HEIGHT * l); l += .05;
        this.ctx.fillText("sends the ship down", WIDTH >> 1, HEIGHT * l); l += .07;
        this.ctx.fillText("The higher you go,", WIDTH >> 1, HEIGHT * l); l += .05;
        this.ctx.fillText("the more points you", WIDTH >> 1, HEIGHT * l); l += .05;
        this.ctx.fillText("score.", WIDTH >> 1, HEIGHT * l); l += .2;


        this.ctx.font = "36px Revalia"; 
        this.ctx.fillText("Click", WIDTH >> 1, HEIGHT * l); l += .07;
        this.ctx.fillText("to play", WIDTH >> 1, HEIGHT * l);
    }
}