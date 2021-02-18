class Element {
    draw (ctx) {
        this.time += 1/60;
        let canvas = ctx.canvas;
        let ch = canvas.height/ctx.dpr, cw = canvas.width/ctx.dpr;
        this.title.fontSize = ch*3/100;
        let y = 0;
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].y = this.buttons[i].y+y;
            this.buttons[i].draw(ctx);
            this.buttons[i].y = this.buttons[i].y-y;
        }
    }
    move (dx, dy) {
        this.x += dx;
        this.y += dy;
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].move(dx, dy);
        }
    }
    mouse (e, action) {
        for (let i = 0; i < this.buttons.length; i++) 
            this.buttons[i].mouse(e,action);
    }
    handle (e, action) {
        for (let i = 0; i < this.buttons.length; i++) 
            this.buttons[i].handle(e, action);
    }
    constructor (x, y, title="untitled", type="shader", notes = [], ins = [], outs = [], consts = []) {
        this.x = x;
        this.y = y;
        this.time = 0;
        this.type = type;
        this.notes = notes;
        this.ins = ins;
        this.outs = outs;
        this.consts =  consts;
        this.buttons = [];
        this.edit = new TextBox (`ℂ=(ℂ-ℝ÷2)÷ℝ₂
Σ i=0 i<100
 ℂ={ℂ₁*ℂ₁-ℂ₂*ℂ₂,2*ℂ₁*ℂ₂}
 ℂ=ℂ-{0.8,0.3}
 இ += 1e-3*exp(-ℂ⋅ℂ)`, 0,35,300,200,true);
        this.title = new TextBox ( title,0,0, 300,35, false, true, 25, true);
        this.ins = new TextBox ( "in : Ψ(ℂ₂) = { }",20,-31,280,20, false, false, 15, true);
        this.outs = new TextBox ( "out : Ψ(ℂ₂) = { இ₄ }",20,235,260,20, false, false, 15, true);
        this.minmax = new Button ("-",()=>{
            if (this.minmax.text === '-') {
                this.minmax.text = '+';
                this.edit.hide();
            } else {
                this.minmax.text = '-';
                this.edit.show();
            }
        },0,-25,15,15); this.minmax.simple = true;
        this.wire1 = new Wire (130, 265, 100, 400, 2);
        this.wire2 = new Wire (170, 265, 120, 400, 1);
        this.wire3 = new Wire ( 230, 265,140, 400, 3);
        this.wire4 = new Wire ( 160, -100,130, -24, 2);
        this.wire5 = new Wire ( 100, -100,170, -24, 1);
        this.wire6 = new Wire ( 120, -100,230, -24, 3);
        //this.consts = new Button (-40,40,40,80, "Const :");
        this.buttons.push(this.edit);
        this.buttons.push(this.title);
        this.buttons.push(this.ins);
        this.buttons.push(this.outs);
        this.buttons.push(this.wire1);
        this.buttons.push(this.wire2);
        this.buttons.push(this.wire3);
        this.buttons.push(this.wire4);
        this.buttons.push(this.wire5);
        this.buttons.push(this.wire6);
        this.buttons.push(this.minmax);
        this.move(this.x, this.y);
    }
}