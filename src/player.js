
class Player {
    constructor() {
        this.img = new Image();
        this.img.src = "./img/ship.png"
        this.maxSide = (FIELD >> 1) - (this.img.width >> 1);
        this.init();

        this.addScore = (s) => this.score += s; 
        this.Y = () => this.img._y;
        this.move = () => this.state = this.state === State.STAY ? State.FLY : this.state;
        this.setState = (st) => {
            this.state = st;
            this.heroMode = st === State.BACK;
        }
    }

    init() {
        this.state = State.STAY;
        this.img._x = 80 + FIELD - this.img.width - 8;
        this.img._y = HEIGHT - this.img.height - 2;
        this.heroMode = false;
        this.heroTime = this.angle = this.counter = 0;
        this.dir = Dir.LEFT;
        this.score = 0;
        this.trails = [];
        this.jetParts = [];
    }

    getRect() {
        return {l:this.img._x, t:this.img._y, r:this.img._x + this.img.width, b:this.img._y + this.img.height};
    }

    draw(ctx) {
        if(this.state === State.DEAD) return;

        let w = this.img.width >> 1,
            h = this.img.height >> 1;
        
        ctx.globalAlpha = this.heroMode ? .5 : 1;
        ctx.save();
        ctx.translate(this.img._x + w, this.img._y + h);
        ctx.rotate(-this.angle);
        ctx.drawImage(this.img, -w, -h);
        ctx.restore();

        for(let r = 0; r < this.trails.length; r++) {
            ctx.save();
            let p = this.trails[r];
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x + w, p.y + h);
            ctx.rotate(-p.angle);
            ctx.drawImage(this.img, -w, -h);
            ctx.restore();
        }

        for(let r = 0; r < this.jetParts.length; r++) {
            let p = this.jetParts[r];
            ctx.fillStyle = `rgba(255, 188, 10, ${p.alpha})`;
            ctx.fillRect(p.x, p.y, 1, 1);
        }

        ctx.globalAlpha = 1;

        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.font = "26px Revalia";
        ctx.fillText(this.score.toFixed(1).toString(), WIDTH >> 1, HEIGHT - 60);
    }

    update(dt) {
        for(let r = 0; r < 16 + Math.random() * 5; r++) {
            let rnd = Math.random() * 5 - 2;
            this.jetParts.push({x:this.img._x + (this.img.width >> 1) + rnd, 
                y:this.img._y + this.img.height - Math.random() * 5, 
                alpha:Math.random()});
        }

        switch(this.state) {
            case State.FLY:
                this.img._x = 80 + ((this.maxSide - 8) * Math.cos(this.counter * Math.PI * .5)) + this.maxSide;
                

                this.angle = Math.tanh(Math.sin(this.counter * Math.PI * .5));

                this.counter += dt * 6;
                
                if(this.img._x < 89 && this.dir === Dir.LEFT) {
                    this.img._x = 88;
                    this.state = State.STAY;
                    this.dir = Dir.RIGHT;
                    this.angle = 0;
                } else if(this.img._x > 80 + FIELD - this.img.width - 8 && this.counter > 2) {
                    this.img._x = 80 + FIELD - this.img.width - 8;
                    this.state = State.STAY;
                    this.dir = Dir.LEFT;
                    this.counter = this.angle = 0;
                }
                this.trails.push({x:this.img._x, y:this.img._y, alpha:.7, angle:this.angle});
            break;
            case State.BACK:
                this.img._y += HEIGHT * dt * 2;
                this.heroTime += dt;
                if(this.img._y > (HEIGHT - this.img.height - 2)) {
                    this.img._y = HEIGHT - this.img.height - 2;
                    this.state = State.STAY;
                    this.heroMode = true;
                }
            break;
        }

        if(this.heroMode) {
            this.heroTime += dt;
            if(this.heroTime > 1.2) {
                this.heroTime = 0;
                this.heroMode = false;
            }
        } else {
            this.img._y = this.img._y > 2 ? this.img._y - 10 * dt : 2;
        }

        for(let r = this.trails.length - 1; r > -1; r--) {
            this.trails[r].alpha -= 6 * dt;
            if(this.trails[r].alpha < 0) {
                this.trails.splice(r, 1);
            }
        }

        for(let r = this.jetParts.length - 1; r > -1; r--) {
            this.jetParts[r].alpha -= 6 * dt;
            if(this.jetParts[r].alpha < 0) {
                this.jetParts.splice(r, 1);
            } else {
                this.jetParts[r].y += 150 * dt;
            }
        }
    }
}