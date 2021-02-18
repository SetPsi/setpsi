class Wire {
    move (dx, dy) {
        this.ax += dx;
        this.ay += dy;
        this.bx += dx;
        this.by += dx;
    }
    handle (e, action) {
        // do nothing
    }
    mouse (e, action) {
        // do nothin :( fer now?
    }
    draw (ctx) {
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = 2;
        ctx.shadowColor = rgba(0,0,0,1);
        ctx.strokeStyle = this.color;
        for (let i = 0; i <  this.N; i++) {
          ctx.lineWidth = 3;
          ctx.beginPath();
          let d = 6*(i-this.N/2);
          let r = .75*Math.sign(this.bx-this.ax)*Math.sign(this.by-this.ay);
          ctx.moveTo( this.ax+d,  this.ay);
          ctx.bezierCurveTo( this.ax+d, .5*( this.ay+this.by)-d*r,  this.bx+d, .5*( this.ay+this.by)-d*r,  this.bx+d, this.by);
            ctx.stroke();
        }
        ctx.shadowColor = "transparent";
    }
    constructor (ax, ay, bx, by, N) {
        this.ax = ax;
        this.ay = ay;
        this.bx = bx;
        this.by = by;
        this.N = N;
        this.color = rgba(Math.random(),Math.random(),Math.random(),1);
    }
}