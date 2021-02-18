class Button {
    move (dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    hide () {
        this.hidden = true;
    }
    show () {
        this.hidden = false;
    }
    handle (e, action) {
        // do nothing.
    }
    mouse (e, action) {
        if (this.hidden) return;
        if (action==="click") {
            let x = e.offsetX, y = e.offsetY;
            if (x < this.x+this.w && x >= this.x && y < this.y+this.h && y >= this.y) {
                this.canvas.style.cursor = "pointer";
                this.onclick();
            }
        } else {
            let x = e.offsetX, y = e.offsetY;
            if (x < this.x+this.w && x >= this.x && y < this.y+this.h && y >= this.y) {
                 this.canvas.style.cursor = "pointer";
                this.hovering = true;
            }
            else 
                this.hovering = false;
        }
    }
    draw (ctx) {
        this.canvas = ctx.canvas;
        if (this.hidden) return;
        let cw = this.canvas.width/ctx.dpr, ch = this.canvas.height/ctx.dpr;
        let gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y+this.h);
        let r = this.uniqueness[0], g = this.uniqueness[1], b = this.uniqueness[2], a = this.uniqueness[3];
        if (this.hovering) {
            gradient.addColorStop(0, rgba(.5+r,0+g,.6+b,.5+a));
            gradient.addColorStop(1, rgba(.6+r,0+g,.6+b,.6+a));
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = -1;
            ctx.shadowOffsetY = 2;
        } else {
            gradient.addColorStop(0, rgba(.6+r,0+g,.6+b,.6+a));
            gradient.addColorStop(1, rgba(.5+r,0+g,.6+b,.5+a));
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = -2;
            ctx.shadowOffsetY = 5;
        }
        let x = this.x+ch*(.1/100)*Math.sin(this.time*.618),
            y = this.y+ch*(.2/100)*Math.sin(this.time+=1/60), 
            w = this.w, 
            h = this.h;
        ctx.lineJoin = "round";
        let bvl = ch*(1/100);
        ctx.lineWidth = bvl;
        ctx.fillStyle = gradient;
        ctx.strokeStyle = gradient;
        ctx.shadowColor = rgba(0,0,0,.6);
        ctx.strokeRect(x+bvl/2,y+bvl/2,w-bvl,h-bvl);
        ctx.shadowColor = "transparent";
        if (w>2*bvl&&h>2*bvl) ctx.fillRect(x+bvl,y+bvl,w-2*bvl,h-2*bvl);
        ctx.fillStyle = rgba(1,1,1,.8);
        this.fontSize = Math.min(this.h,this.w/(this.text.length*.65))*(2/3);
        ctx.font = this.fontSize + "px Courier New";
        w = ctx.measureText(this.text).width;
        ctx.fillText(this.text,this.x+(this.w-w)/2, this.y+this.h*(2/3));
    }
    constructor (text, onclick, x=0, y=0, w=100, h=100,  fontSize = 28) {
        this.hidden = false;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.onclick = onclick;
        this.hovering = false;
        this.fontSize = fontSize;
        this.time = 100*Math.random();
        let a = .1;
        this.uniqueness = [a*Math.random(),3*a*Math.random(),a*Math.random(),a*Math.random()];
    }
}