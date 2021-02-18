class CodeEditor {
    wheel (e) {
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].wheel) this.buttons[i].wheel(e);
        }
    }
    handle (e, action) {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].handle(e,action);
        }
    }
    mouse (e, action) {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].mouse(e,action);
        }
    }
    draw (ctx) {
        let canvas = this.canvas = ctx.canvas, ch = canvas.height/ctx.dpr, cw = canvas.width/ctx.dpr;
        this.title.fontSize = ch*4/100;
        this.title.x = ch*1/100;
        this.title.y = ch*1/100;
        this.title.width = (this.title.text[0].length+5);
        this.title.height = 1.05;
        for (let i = 0; i < this.header_buttons; i++) {
            this.buttons[i].w = ch*10/100;
            this.buttons[i].h = ch*5/100;
            this.buttons[i].x = this.title.w+ch*(3/100+12/100*i);
            this.buttons[i].y = ch*1/100;
        }
        this.edit.fontSize = ch*3/100;
        this.edit.x = ch*2/100;
        this.edit.y = ch*8/100;
        this.edit.width = (cw-ch*5/100)/.6/this.edit.fontSize;
        this.edit.height = (ch*2/3-ch*8/100)/1.5/this.edit.fontSize;
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].draw(ctx);
        }
    }
    constructor (title) {
        this.buttons = [];
        this.title = new TextBox ( title,10,70, 300,35, false, true, 25, true);
        this.edit = new TextBox (`ℝ = {512,512}
இ[ℂ : ℝ] = 0
ℂ =(ℂ-ℝ÷2)÷ℝ₂
Σ i=0 i<100
 ℂ={ℂ₁*ℂ₁-ℂ₂*ℂ₂,2*ℂ₁*ℂ₂}
 ℂ=ℂ-{0.8,0.3}
 இ += 1ᴇ-3*exp(-ℂ⋅ℂ)
இ :`,10,115,300,200,true);
 
        this.fullScreen = false;
        this.full = new Button ("Full",()=>{
            if (this.fullScreen) {
                this.fullScreen = false;
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
              } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
              }
            } else {
                this.fullScreen = true;
                if(this.canvas.webkitRequestFullScreen) {this.canvas.webkitRequestFullScreen();}
                else {this.canvas.mozRequestFullScreen();}
            }});
        this.login = new Button ("Login",()=>{
                window.location.href = `${ window.location.origin }/login`;
            });
        this.save = new Button ("Save",()=>{
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                  if (this.readyState == 4 && this.status == 200) {
                    alert ( this.responseText );
                  }
                };
                xmlhttp.open("GET", "save.php?state=" + "test", true);
                xmlhttp.send();
            });
        if (window.can_edit) this.buttons.push(this.save);
        else          this.buttons.push(this.login);
        this.buttons.push(this.full);
        this.header_buttons = this.buttons.length;
        
        this.buttons.push(this.edit);
        this.buttons.push(this.title);
    }
    
}
