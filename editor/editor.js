class Editor {
    draw (ctx) {
        let canvas = ctx.canvas,
            ch = canvas.height/ctx.dpr, cw = canvas.width/ctx.dpr;
        let grd = ctx.createLinearGradient(0,0,0,ch);
        grd.addColorStop(0, "red");
        grd.addColorStop(1, "purple");
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        for (let i = 0; i < this.buttons.length; i++) 
            this.buttons[i].draw(ctx);
    }
    wheel (e) {
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].wheel) this.buttons[i].wheel(e);
        }
    }
    mouse (e, action) {
        this.canvas.style.cursor = "default";
        for (let i = 0; i < this.buttons.length; i++) 
            this.buttons[i].mouse(e,action);
    }
    handle (e, action) {
        for (let i = 0; i < this.buttons.length; i++) 
            this.buttons[i].handle(e, action);
    }
    constructor (canvas) {
        this.canvas = canvas;
        this.canvas.addEventListener('contextmenu', function(ev) {
            let tb = window.activeTextBox;
            if (tb&&tb.active) {
                ev.preventDefault();
                tb.select = tb.prevSelect;
                if (tb.select0===tb.select2&&tb.select1===tb.select3) {
                    tb.select0 = tb.select0;
                    tb.select1 = 0;
                    tb.select2 = tb.select0;
                    tb.select3 = tb.text[tb.select0].length;
                }
                navigator.clipboard.writeText(tb.selection);
                return false;
            }
        }, false);
        this.buttons = [];
        this.buttons.push(new CodeEditor(window.title));
        this.buttons.push(new Options ());
        this.buttons.push(new Keyboard ());
        document.onkeydown = (e) => {
            this.handle(e,"down");
        };
        document.onkeyup = (e) => {
            this.handle(e,"up");
        };
        this.canvas.onwheel = (e) => {
            e.preventDefault();
            this.wheel(e);  
        };
        this.canvas.onmousedown = (e) => {
            this.mouse(e,"start");
        };
        this.canvas.onmouseout = this.canvas.onmouseup = (e) => {
            this.mouse(e,"end");
        };
        this.canvas.onmousemove = (e) => {
            this.mouse(e,"move");
        };
        this.canvas.onclick = (e) => {
            this.mouse(e,"click");
        };
    }
}