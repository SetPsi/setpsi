class Options {
    draw (ctx) {
        let canvas = ctx.canvas;
        let ch = canvas.height/ctx.dpr, cw = canvas.width/ctx.dpr;
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = 2;
        let x = cw*(2/3)-ch*(5/100), y = ch*(2/3+1/100), w = cw*(1/3)+ch*(4/100), h = ch*(1/3-2/100);
        let grd = ctx.createLinearGradient(x, y,x, y+h);
        grd.addColorStop(0,rgba(0,0,0,.1));
        grd.addColorStop(1,rgba(0.1,0.2,0.3,.1));
        ctx.fillStyle = "white";
        ctx.font = Math.ceil(ch*2/100)+"px Courier New";
        ctx.fillStyle = grd;
        ctx.fillRect(x,y,w,h);
        ctx.fillStyle = "white";
        ctx.font = Math.floor(ch*2.5/100)+"px Courier New";
        ctx.fillText ("Create", x+ch*1/100, y+ch*2.5/100);
        ctx.shadowColor = "transparent";
        
        let N = 2, M = Math.ceil(this.buttons.length/N);
        for (let i = 0; i < this.buttons.length; i++) {
            let x = i%N, y = Math.floor(i/N);
            let butt = this.buttons[i];
            butt.w = (cw*1/3-ch*3/100)/N + ch*(2/100);
            butt.h = (ch*(1/3)-ch*5/100)/M - ch*(1/100);
            butt.x = (cw*1/3+ch*3/100)*x/N-ch*(4/100)+cw*(2/3);
            butt.y = (ch*1/3-ch*7/100)*y/M+ch*(5/100+2/3);
            butt.draw(ctx);
        }
    }
    mouse (e, action) {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].mouse(e,action);
        }
    }
    handle (e, action) {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].handle(e,action);
        }
    }
    constructor () {
        this.buttons = [];
        this.buttons.push(new Button ("{Set}", ()=>{}));
        this.buttons.push(new Button ("Borrow Code", ()=>{}))
        this.buttons.push(new Button ("Display", ()=>{}));
        this.buttons.push(new Button ("File Input", ()=>{}));
        this.buttons.push(new Button ("Number Input", ()=>{}));
        this.buttons.push(new Button ("Code Input", ()=>{}));
        this.buttons.push(new Button ("Mouse Event", ()=>{}));
        this.buttons.push(new Button ("Keyboard Event", ()=>{}));
    }
}