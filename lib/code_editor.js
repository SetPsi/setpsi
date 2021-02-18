if (!String.prototype.splice) {
    String.prototype.splice = function(start, delCount, newSubStr="") {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}
const rgba = (r,g,b,a) => {
    return "rgba("+
        Math.floor(r*255)+","+
        Math.floor(g*255)+","+
        Math.floor(b*255)+","+
        a
    ")";
}
class CodeEditor {
    
    addState () {
        if (this.state_index<this.state_stack.length)
            this.state_stack.splice(0,this.state_index);
        if (this.state_index<this.state_stack.length) this.state_stack.splice(this.state_index);
        this.state_stack.push({text:this.text.slice(),cursor:this.cursor.slice(),select:this.select.slice()});
        this.state_index++;
    }
    incrementState () {
        if (this.state_index<this.state_stack.length-1) {
            this.cursor = this.state_stack[this.state_index].cursor.slice();
            this.select = this.state_stack[this.state_index].select.slice();
            this.text   = this.state_stack[this.state_index].text.slice();
            this.state_index++;
        }
    }
    decrementState () {
        if (this.state_index>0) {
            this.state_index--;
            this.cursor = this.state_stack[this.state_index].cursor.slice();
            this.select = this.state_stack[this.state_index].select.slice();
            this.text   = this.state_stack[this.state_index].text.slice();
        }
    }
    
    get selection () {
        let start = 0, delta = 0;
        for (let i = 0; i < this.select[0]; i++) {
            start += this.text[i].length+1;
        }
        start += this.select[1];
        if (this.select[0]!==this.select[2]) {
            delta += this.text[this.select[0]].length-this.select[1]+1;
            for (let i = this.select[0]+1; i < this.select[2]; i++) {
                delta += this.text[i].length+1;
            }
            delta += this.select[3];
        } else {
            delta = this.select[3]-this.select[1];
        }
        return this.text.join("\n").substring(start,start+delta);
    
    }
    
    set selection (value="") {
        this.addState();
        let start = 0, delta = 0;
        for (let i = 0; i < this.select[0]; i++) {
            start += this.text[i].length+1;
        }
        start += this.select[1];
        if (this.select[0]!==this.select[2]) {
            delta += this.text[this.select[0]].length-this.select[1]+1;
            for (let i = this.select[0]+1; i < this.select[2]; i++) {
                delta += this.text[i].length+1;
            }
            delta += this.select[3];
        } else {
            delta = this.select[3]-this.select[1];
        }
        this.text = this.text.join("\n").splice(start,delta,value).split("\n");
        value = value.split("\n");
        this.cursor[0] = this.select[0]+value.length-1;
        if (value.length===1) this.cursor[1] = this.select[1]+value[0].length;
        else this.cursor[1] = value[value.length-1].length;
        this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
    }
    
    handle (e, delta ="down") {
        if(e.which == 9) e.preventDefault();
        let key = e.key.toLowerCase();
        this.keys[key] = delta;
        if (e.getModifierState("CapsLock")) 
             this.keys["capslock"] = "down";
        else this.keys["capslock"] = "up";
        
        if (this.keys["space"]=="down") key = " ";
        if (this.keys["tab"]=="down") key = "\t";
        if (delta == "up") return;
        if (key==="escape") {
            if (this.select[0]!==this.select[2]||this.select[1]!==this.select[3]) {
                this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
            }
        } else if (key==="capslock"||key==="alt"||key==="meta"||key==="control"||key==="contextmenu" || key==="end" || key==="pagedown" || key==="pageup" || key==="help" || (key.length > 1 && key[0]==="f")) {
            // do nothing  
        } else if (key==="shift") {
            if (this.keys["shift"]==="down") {
                if (this.cursor[1]<this.select[1]) {
                    this.select[1]=this.cursor[1];
                } else {
                    this.select[3]=this.cursor[1];
                }
            }
        } else if (key==="backspace" || key==="delete") { 
            if (this.select[0]!==this.select[2]||this.select[1]!==this.select[3]) {
                this.selection = "";
            } else if (this.cursor[1] === 0 && this.cursor[0] > 0) {
                let t = this.text[this.cursor[0]];
                this.text.splice(this.cursor[0]);
                this.cursor[0] = this.cursor[0]-1;
                this.cursor[1] = this.text[this.cursor[0]].length;
                this.text[this.cursor[0]] = this.text[this.cursor[0]]+t;
            } else if (this.cursor[1]>0) {
                this.text[this.cursor[0]]=this.text[this.cursor[0]].splice(this.cursor[1]-1,1);
                this.cursor[1] -= 1;
            }
            this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
        } else if (key==="enter") { 
            this.selection = "\n";
        } else if (key==="arrowleft") { 
            let i = this.cursor[1]-1;
            if (i < 0 && this.cursor[0]>0) {
                this.cursor[0] -= 1;
                this.cursor[1] = this.text[this.cursor[0]].length;
            } else if (i >= 0) this.cursor[1] = i;
            else return;
            if (this.keys["shift"]==="down") {
                if (this.cursor[0]<this.select[0]||(this.cursor[0]===this.select[0]&&this.cursor[1]<this.select[1])) {
                    this.select[0] = this.cursor[0];
                    this.select[1] = this.cursor[1];
                } else {
                    this.select[2] = this.cursor[0];
                    this.select[3] = this.cursor[1];
                }
            } else this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
        } else if (key==="arrowright") { 
            let i = this.cursor[1]+1;
            if (i > this.text[this.cursor[0]].length && this.cursor[0]<this.text.length-1) {
                this.cursor[0] = Math.min(this.text.length-1,this.cursor[0]+1);
                this.cursor[1] = 0;
            } else if (i <= this.text[this.cursor[0]].length) this.cursor[1] = i;
            else return;
            if (this.keys["shift"]==="down") {
                if (this.cursor[0]>this.select[2]||(this.cursor[0]===this.select[2]&&this.cursor[1]>this.select[3])) {
                    this.select[2] = this.cursor[0];
                    this.select[3] = this.cursor[1];
                } else {
                    this.select[0] = this.cursor[0];
                    this.select[1] = this.cursor[1];
                }
            } else this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
        } else if (key==="arrowup") { 
            let i = this.cursor[0]-1;
            if (i >= 0) {
                this.cursor[0] = i;
                this.cursor[1] = Math.min(this.cursor[1],this.text[this.cursor[0]].length);
            } else if (this.cursor[1]!=0) this.cursor[1] = 0;
            else return;
            if (this.keys["shift"]==="down") {
                if (this.cursor[0]<this.select[0]||(this.cursor[0]===this.select[0]&&this.cursor[1]<this.select[1])) {
                    this.select[0] = this.cursor[0];
                    this.select[1] = this.cursor[1];
                } else {
                    this.select[2] = this.cursor[0];
                    this.select[3] = this.cursor[1];
                }
            } else this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
        } else if (key==="arrowdown") {
            let i = this.cursor[0]+1;
            if (i < this.text.length) {
                this.cursor[0] = i;
                this.cursor[1] = Math.min(this.cursor[1],this.text[this.cursor[0]].length);
            } else if (this.cursor[1] != this.text[this.cursor[0]].length) this.cursor[1] = this.text[this.cursor[0]].length;
            else return;
            if (this.keys["shift"]==="down") {
                if (this.cursor[0]>this.select[2]||(this.cursor[0]===this.select[2]&&this.cursor[1]>this.select[3])) {
                    this.select[2] = this.cursor[0];
                    this.select[3] = this.cursor[1];
                } else {
                    this.select[0] = this.cursor[0];
                    this.select[1] = this.cursor[1];
                }
            } else this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
        } else if (this.keys["control"]==="down"||this.keys["meta"]==="down"){
            if (key==="c") {
                if (this.select[0]===this.select[2]||this.select[1]===this.select[3]) 
                    this.select = [this.select[0],0,this.select[0],this.text[this.select[0]].length];
                navigator.clipboard.writeText(this.selection);
            }
            if (key==="x") { 
                if (this.select[0]===this.select[2]||this.select[1]===this.select[3]) 
                    this.select = [this.select[0],0,this.select[0],this.text[this.select[0]].length];
                navigator.clipboard.writeText(this.selection);
                this.selection = "";
            }
            if (key==="v") {
                navigator.clipboard.readText().then(
                    clipText => this.selection = clipText);
            }
            if (key==="a") {
                this.cursor = [this.text.length-1,this.text[this.text.length-1].length];
                this.select = [0,0,this.text.length-1,this.text[this.text.length-1].length];
            }
            if (key==="z") {
                if (this.keys["shift"]==="down") this.incrementState();
                else this.decrementState();
            }
        } else {
            if (this.keys["shift"]==="down"||(this.keys["capslock"]==="down"&&!this.keys["shift"]==="down")) 
                key = key.toUpperCase();
            this.selection = key;
        }
    }
    
    mouse (e, delta = "start") {
        let x = e.offsetX, y = e.offsetY;
        x = x/(.6*this.fontSize)-4.5;
        y = y/(1.5*this.fontSize)-1.1;
        x = Math.ceil(x);
        y = Math.ceil(y);
        if (delta === "start") {
            this.mouse_down = true;
            this.cursor[0] = Math.min(Math.max(y,0),this.text.length-1);
            this.cursor[1] = Math.min(Math.max(x,0),this.text[this.cursor[0]].length);
            this.select = [this.cursor[0],this.cursor[1],this.cursor[0],this.cursor[1]];
        }
        if (delta === "end") {
            this.mouse_down = false;
        }
        if (delta === "move" && this.mouse_down === true) {
            let i = Math.min(Math.max(y,0),this.text.length-1);
            let j = Math.min(Math.max(x,0),this.text[this.cursor[0]].length);
            if ((i<this.cursor[0]||(i===this.cursor[0]&&j<this.cursor[1]))) {
                if (i>this.select[0]||(i===this.select[0]&&j>this.select[1])) {
                    this.select[2] = i;
                    this.select[3] = j;
                } else {
                    this.select[0] = i;
                    this.select[1] = j;
                }
            } else if ((i>this.cursor[0]||(i===this.cursor[0]&&j>this.cursor[1]))) {
                if (i<this.select[2]||(i===this.select[2]&&j<this.select[3])) {
                    this.select[0] = i;
                    this.select[1] = j;
                } else {
                    this.select[2] = i;
                    this.select[3] = j;
                }
            }
            this.cursor = [i,j];
            
        }
    }
    
    display (time) {
        time *= .2;
        let text = this.text, ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, cursor = this.cursor;
        cursor[1] = Math.min(cursor[1],text[cursor[0]].length);
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,w,h);
        var grd = ctx.createLinearGradient(0,0,25,h);
        grd.addColorStop(0,rgba(0.7+0.3*Math.sin(time),0,0.7-0.3*Math.sin(time),1));
        grd.addColorStop(.5,rgba(0.7+0.3*Math.sin(time+1.5),0,0.7-0.3*Math.sin(time+1.5),1));
        grd.addColorStop(1,rgba(0.7+0.3*Math.sin(time+3),0,0.7-0.3*Math.sin(time+3),1));
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,25,h);
        ctx.fillStyle = "white";
        ctx.font = this.fontSize+"px Courier New";
        for (let i = 0, l = text.length; i < l; i++) {
            ctx.fillText(i+"\t\t\t"+text[i], 5, (1+i) * 1.5*this.fontSize);
        }
        ctx.fillStyle = rgba(1,1,1,.5*(.8+0.2*Math.sin(30*time)));
        ctx.fillRect((4.5+cursor[1])*.6*this.fontSize,1.5*this.fontSize*(1.1+cursor[0]),2,-this.fontSize);
        ctx.fillStyle = rgba(1,1,1,.5);
        for (let i = this.select[0]; i <= this.select[2]; i++) {
            let s = (i==this.select[0])?(this.select[1]):(0),
                e = (i==this.select[2])?(this.select[3]):(this.text[i].length);
            ctx.fillRect((4.5+s)*.6*this.fontSize,1.5*this.fontSize*(1.2+i),this.fontSize*.6*(e-s),-1.5*this.fontSize);
        }
    }
    
    get value () {
        return this.text.join("\n");
    }
    set value (txt) {
        this.addState();
        thsi.text = txt.split("\n");
        this.cursor = [0,0];
        this.select = [0,0,0,0];
    }
    
    
    constructor (canvas, fontSize="20", text = '') {
        this.canvas = canvas;
        this.canvas.style.cursor = "text";
        this.ctx = this.canvas.getContext('2d');
        this.text = text.split('\n');
        this.fontSize = 20;
        this.cursor = [0,0];
        this.select = [0,0,0,0];
        this.state_stack = [];
        this.state_index = 0;
        this.keys = {};
        this.time = 0;
        this.mouse_down = false;
        this.canvas.onmousedown = (e) => {this.mouse(e,"start");}
        this.canvas.onmousemove = (e) => {this.mouse(e,"move");}
        this.canvas.onmouseout = this.canvas.onmouseup = (e) => {this.mouse(e,"end");}
        let animate = () => {
            requestAnimationFrame(animate);
            this.display(this.time+=1/60);
        }
        animate();
    }
}