
class Level {
    constructor() {
        this.img1 = new Image(); this.img2 = new Image();

        this.cnv1 = document.createElement("canvas");
        this.cnv2 = document.createElement("canvas");
        
        this.cnv1.width = this.cnv2.width = WIDTH;
        this.cnv1.height = this.cnv2.height = HEIGHT << 1;

        this.ctx1 = this.cnv1.getContext("2d");
        this.ctx2 = this.cnv2.getContext("2d");
        this.ctx1.hei = this.ctx2.hei = HEIGHT << 1;

        this.img1._y = -this.ctx1.hei;
        this.img2._y = this.img1._y - this.ctx2.hei;

        this.sideCnt = 0; this.lastSide = -1; this.step = 150;

        this.barriers = [];
        this.addBarriers(this.ctx1); this.addBarriers(this.ctx2);

        this.img1.src = this.cnv1.toDataURL();
        this.img2.src = this.cnv2.toDataURL();
    }

    addBarriers(ctx, c) {
        ctx.clearRect(0, 0, WIDTH, ctx.hei);
        let w = Math.floor(WIDTH / 3);
        for(let r = ctx.hei; r > -1; r -= this.step) {
            let s = Math.floor(Math.random() * 2);

            if(this.lastSide === s) {
                if(++this.sideCnt > 4) {
                    s = s === 1 ? 0 : 1;
                    this.sideCnt = 1;
                }
            } else {
                this.sideCnt = 1;
            }
            
            this.lastSide = s;

            let b = {l:0, t:0, r:0, b:0};
            if(s === 1) {
                b.l = WIDTH - w; b.t = r; b.r = WIDTH; b.b = r + 20;
                //ctx.fillRect(WIDTH - w, r, w, 20);
            } else {
                b.l = 0; b.t = r; b.r = w; b.b = r + 20;
                //ctx.fillRect(0, r, w, 20);
            }

            this.barriers.push(b);
            ctx.fillRect(b.l, b.t, w, 20);
        }
    }

    draw(ctx) {
        ctx.drawImage(this.img1, 0, this.img1._y);
        ctx.drawImage(this.img2, 0, this.img2._y);
    }

    update(dt) {
        this.img1._y += this.step * dt * 2;
        this.img2._y += this.step * dt * 2;

        if(this.img1._y > HEIGHT) {
            this.img1._y = this.img2._y - this.ctx1.hei; 
            this.addBarriers(this.ctx1);
            this.img1.src = this.cnv1.toDataURL();
        }

        if(this.img2._y > HEIGHT) {
            this.img2._y = this.img1._y - this.ctx2.hei;
            this.addBarriers(this.ctx2);
            this.img2.src = this.cnv2.toDataURL();
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