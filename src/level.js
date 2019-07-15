

class Level {
    constructor() {
        this.init();
    }

    init() {
        this.sideCnt = 0; 
        this.lastSide = -1; 
        this.speed = 200;
        this.barrierTime = 0;
        this.barriers = [];
        this.barrierWid = 80;
        this.barrierHei = 20;
        this.nextB = .75;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    addBarriers() {
        let w = Math.floor(WIDTH / 2.5),
            s = Math.floor(Math.random() * 2);

        if(this.lastSide === s) {
            if(++this.sideCnt > 4) {
                s = s === 1 ? 0 : 1;
                this.sideCnt = 1;
            }
        } else {
            this.sideCnt = 1;
        }
        
        this.lastSide = s;

        let b = {l:0, t:-20, r:0, b:0};
        if(s === 1) {
            b.l = WIDTH - 80 - this.barrierWid; b.r = WIDTH - 80;
        } else {
            b.l = 80; b.r = 80 + this.barrierWid;
        }
        this.barriers.push(b);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, 80, HEIGHT);
        ctx.fillRect(WIDTH - 80, 0, 80, HEIGHT);
        
        ctx.strokeStyle = "#222";
        let st = HEIGHT - 180, s = 0;
        ctx.beginPath();
        ctx.moveTo(40, st);
        ctx.fillStyle = "white";
        ctx.font = "14px Revalia"; 
        for(let z = 0; z < 6; z++) {
            if(s < VALS.length) ctx.fillText(VALS[s++] + ' Pts', 42, st - 18);
            ctx.lineTo(WIDTH - 40, st);
            st -= 45;
            ctx.moveTo(WIDTH - 40, st);
            if(s < VALS.length) ctx.fillText(VALS[s++] + ' Pts', WIDTH - 44, st - 18);
            ctx.lineTo(40, st);
            st -= 45;
            ctx.moveTo(40, st);
        }
        ctx.stroke();

        ctx.fillStyle = this.color;
        for(let o = 0; o < this.barriers.length; o++) {
            let b = this.barriers[o];
            ctx.fillRect(b.l, b.t, this.barrierWid, this.barrierHei);
        }
    }

    update(dt) {
        this.barrierTime += dt;
        if(this.barrierTime > this.nextB) {
            this.addBarriers();
            this.barrierTime = 0;
            this.speed += dt * 4;
        }

        for(let o = this.barriers.length - 1; o > -1; o--) {
            this.barriers[o].t += dt * this.speed;
            if(this.barriers[o].t > HEIGHT) {
                this.barriers.splice(o, 1);
            } else {
                this.barriers[o].b = this.barriers[o].t + 20;
            }
        }
    }

    checkCollision(r) {
        function hasCollided(b, r) {
            return!(b.l > r.r || b.r < r.l || b.t > r.b || b.b < r.t);
        }

        for(let o = 0; o < this.barriers.length; o++) {
            if(hasCollided(this.barriers[o], r)) return true;
        }
        return false;
    }
}