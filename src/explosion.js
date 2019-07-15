
class Explosion {
    constructor() {
        this.state = State.DEAD;
        this.initialSpeed = 250;
        this.particles = [];
    }

    start(x, y) {
        this.state = State.ALIVE;
        this.initialSpeed = 250;
        for(let z = 0; z < 100; z++) {
            let a = Math.random() * 2 * Math.PI,
                sz = Math.random() * 5 + 3;
            this.particles.push({
                x: x, y: y, a: 1,
                s: sz,
                r: 200 + Math.random() * 56,
                g: 120 + Math.random() * 56,
                vx: Math.random() * Math.cos(a) * (sz / 5),
                vy: Math.random() * Math.sin(a) * (sz / 5)
            });
        }
    }

    update(dt) {
        if(this.state == State.DEAD) return;
        let cnt = 0;
        for(let z = 0; z < this.particles.length; z++) {
            let p = this.particles[z];
            if(p.a < 0) continue;
            cnt++;
            p.x += p.vx * dt * this.initialSpeed;
            p.y += p.vy * dt * this.initialSpeed;
            p.a -= dt * 2;
            this.initialSpeed += 1.5 * dt;
            this.particles[z] = p;
        }
        this.state = cnt < 1 ? State.DEAD : State.ALIVE;
    }

    draw(ctx) {
        if(this.state == State.DEAD) return;
        for(let z = 0; z < this.particles.length; z++) {
            let p = this.particles[z];
            if(p.a < 0) continue;
            ctx.fillStyle = `rgba(${p.r}, ${p.g}, 30, ${p.a})`;
            ctx.fillRect(p.x, p.y, p.s, p.s);
        }
    }
}