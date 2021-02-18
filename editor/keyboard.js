class Keyboard {
    draw (ctx) {
        let canvas = ctx.canvas;
        let ch = canvas.height/ctx.dpr, cw = canvas.width/ctx.dpr;
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = 2;
        // Keyboard Block
        let x = ch*(1/100), y = ch*(2/3+1/100), w = cw*(2/3)-ch*(7/100), h = ch*(1/3-2/100);
        let grd = ctx.createLinearGradient(x, y,x, y+h);
        grd.addColorStop(0,rgba(0,0,0,.1));
        grd.addColorStop(1,rgba(0.1,0.2,0.3,.1));
        ctx.fillStyle = grd;
        ctx.fillRect(x,y,w,h);
        ctx.fillStyle = "white";
        ctx.font = Math.ceil(ch*2/100)+"px Courier New";
        // Variable Block
        grd = ctx.createLinearGradient(x, y,x, y+h);
        grd.addColorStop(0,rgba(0,0,0,.1));
        grd.addColorStop(1,rgba(0.1,0.2,0.3,.1));
        x = ch*(2/100); y = ch*(2/3+2/100); w = cw*(2/3)*(1/2)-ch*(5/100); h = ch*(1/3-4/100);
        ctx.fillStyle = "white";
        ctx.fillStyle = grd;
        ctx.fillRect(x,y,w,h);
        ctx.fillStyle = "white";
        ctx.font = Math.floor(ch*2.5/100)+"px Courier New";
        ctx.fillText ("Variables", x+ch*1/100, y+ch*2.5/100);
        // Operations Block
        grd = ctx.createLinearGradient(x, y,x, y+h);
        grd.addColorStop(0,rgba(0,0,0,.1));
        grd.addColorStop(1,rgba(0.1,0.2,0.3,.1));
        x = cw*(2/3*1/2)-ch*(2/100); ch*(2/100); y = ch*(2/3+2/100); w = cw*(2/3)*(1/2)-ch*(5/100); h = ch*(1/3-4/100);
        ctx.fillStyle = "white";
        ctx.fillStyle = grd;
        ctx.fillRect(x,y,w,h);
        ctx.fillStyle = "white";
        ctx.fillText ("Operations", x+ch*1/100, y+ch*2.5/100);
        
        ctx.shadowColor = "transparent";
        let N = 4, M = Math.ceil(this.varButtons/N);
        for (let i = 0; i < this.varButtons; i++) {
            let x = i%N, y = Math.floor(i/N);
            let butt = this.buttons[i];
            butt.w = (cw*1/3-ch*6/100)/N - ch*(1/100);
            butt.h = (ch*(1/3)-ch*8/100)/M - ch*(1/100);
            butt.x = (cw*1/3-ch*6/100)*x/N+ch*(3/100);
            butt.y = (ch*1/3-ch*8/100)*y/M+ch*(6/100+2/3);
        }
        M = Math.ceil(this.oppButtons/N);
        for (let i = 0; i < this.oppButtons; i++) {
            let x = i%N, y = Math.floor(i/N);
            let butt = this.buttons[this.varButtons+i];
            butt.w = (cw*1/3-ch*6/100)/N - ch*(1/100);
            butt.h = (ch*(1/3)-ch*8/100)/M - ch*(1/100);
            butt.x = cw*1/3-ch*3/100+(cw*1/3-ch*6/100)*x/N+ch*(2/100);
            butt.y = (ch*1/3-ch*8/100)*y/M+ch*(6/100+2/3);
        }
        
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].draw(ctx);
        }
        
    }
    mouse (e, action) {
        for (let i= 0; i < this.buttons.length; i++) {
            this.buttons[i].mouse(e,action);
        }
    }
    handle (e, action) {
        
    }
    press (c) {
    	let t = window.activeTextBox;
    	if (!t) return;
    	t.active = true;
		if (c=="[]"||c==="{}"||c=="()") {
			t.selection = c[0] + t.selection + c[1];
			t.populateCharCodes();
			t.select1 = t.select3 = t.cursor1 = t.cursor1 - 1;
		} else {
			t.selection = c;
		    window.mostRecentChar = c;
		}
    } 
    constructor () {
        window.mostRecentChar = "χ";
        window.activeTextBox = {};
        this.buttons = [];
        this.buttons.push(new Button("Ψ", ()=>{this.press("Ψ");}));
        this.buttons.push(new Button("χ", ()=>{this.press("χ");}));
        this.buttons.push(new Button("变", ()=>{this.press("变");}));
        this.buttons.push(new Button("ጬ", ()=>{this.press("ጬ");}));
        this.buttons.push(new Button("φ", ()=>{this.press("φ");}));
        this.buttons.push(new Button("ω", ()=>{this.press("ω");}));
        this.buttons.push(new Button("θ", ()=>{this.press("θ");}));
        this.buttons.push(new Button("⚛", ()=>{this.press("⚛");}));
        this.buttons.push(new Button("᯽", ()=>{this.press("᯽");}));
        this.buttons.push(new Button("ᘠ", ()=>{this.press("ᘠ");}));
        this.buttons.push(new Button("♫", ()=>{this.press("♫");}));
        this.buttons.push(new Button("இ",()=>{this.press("இ");}));
        this.buttons.push(new Button("𝕋", ()=>{this.press("𝕋");}));
        this.buttons.push(new Button("ℝ", ()=>{this.press("ℝ");}));
        this.buttons.push(new Button("ℂ", ()=>{this.press("ℂ");}));
        this.buttons.push(new Button("𝕀", ()=>{this.press("𝕀");}));
        this.buttons.push(new Button("φ₁", ()=>{this.press("₁");}));
        this.buttons.push(new Button("φ₂", ()=>{this.press("₂");}));
        this.buttons.push(new Button("φ₃", ()=>{this.press("₃");}));
        this.buttons.push(new Button("φ₄", ()=>{this.press("₄");}));
        
                            
        this.varButtons = this.buttons.length;
        this.buttons.push(new Button("()", ()=>{this.press("()");}));
        this.buttons.push(new Button("[]", ()=>{this.press("[]");}));
        this.buttons.push(new Button("{}", ()=>{this.press("{}");}));
        this.buttons.push(new Button("Σ", ()=>{this.press("Σ");}));
        this.buttons.push(new Button("+", ()=>{this.press("+");}));
        this.buttons.push(new Button("-", ()=>{this.press("-");}));
        this.buttons.push(new Button("*", ()=>{this.press("*");}));
        this.buttons.push(new Button("÷", ()=>{this.press("÷");}));
        this.buttons.push(new Button("×", ()=>{this.press("×");}));
        this.buttons.push(new Button("⋅", ()=>{this.press("⋅");}));
        this.buttons.push(new Button("=", ()=>{this.press("=");}));
        this.buttons.push(new Button("≠", ()=>{this.press("≠");}));
        this.buttons.push(new Button("<", ()=>{this.press("<");}));
        this.buttons.push(new Button(">", ()=>{this.press(">");}));
        this.buttons.push(new Button("≤", ()=>{this.press("≤");}));
        this.buttons.push(new Button("≥", ()=>{this.press("≥");}));
        this.buttons.push(new Button("if", ()=>{this.press("if");}));
        this.buttons.push(new Button("else", ()=>{this.press("else");}));
        this.buttons.push(new Button("and", ()=>{this.press("&&");}));
        this.buttons.push(new Button("or", ()=>{this.press("||");}));
        this.oppButtons = this.buttons.length-this.varButtons;
        
    }
}