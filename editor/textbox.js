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
        a+
    ")";
};
const charCode = (c) => {
    return c.charCodeAt(0);
};
const codeChar = (n) => {
    return String.fromCharCode(n);
};
const dummy = (c) => {
    return 55600 < c && c < 57343;
};
const isDummy = (c) => {
    return dummy(charCode(c));
};

class TextBox {
    hide () {
        this.hidden = true;
    }
    show () {
        this.hidden = false;
    }
    move (dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    addState () {
        this.state_stack=this.state_stack.splice(0,this.state_index+1);
        this.state_stack.push({text:this.text.slice(),charCodes:this.charCodes.slice(),cursor:this.cursor.slice(),select:this.select.slice()});
        this.state_index=this.state_stack.length-1;
    }
    incrementState () {
        if (this.state_index<this.state_stack.length-1) {
            this.state_index++;
            this.cursor = this.state_stack[this.state_index].cursor.slice();
            this.select = this.state_stack[this.state_index].select.slice();
            //this.text   = this.state_stack[this.state_index].text.slice();
            this.charCodes = this.state_stack[this.state_index].charCodes.slice();
            this.populateText();
        }
    }
    decrementState () {
        if (this.state_index==this.state_stack.length-1) {this.addState();}
        if (this.state_index>0) {
            this.state_index--;
            this.cursor = this.state_stack[this.state_index].cursor.slice();
            this.select = this.state_stack[this.state_index].select.slice();
            //this.text   = this.state_stack[this.state_index].text.slice();
            this.charCodes = this.state_stack[this.state_index].charCodes.slice();
            this.populateText();
        }
    }
    codeAt (i,j) {
        if (i>=0&&i<this.text.length&&j>=0&&j<this.text[i].length)
            return charCode(this.text[i][j]);
        else return '';
    }
    charAt (i,j) {
        let c = 0;
        if (i>=0&&i<this.charCodes.length&&j>=0&&j<this.charCodes[i].length) {
            c = this.charCodes[i][j];
        }
        return codeChar(c);
    }
    populateCharCodes () {
        this.charCodes = new Array(this.text.length);
        for (let i = 0; i < this.charCodes.length; i++) {
            this.charCodes[i] = new Array(this.text[i].length);
            for (let j = 0; j < this.charCodes[i].length; j++) {
                this.charCodes[i][j] = this.codeAt(i,j);
            }
        }
    }
    populateText () {
        this.text = new Array(this.charCodes.length);
        for (let i = 0; i < this.text.length; i++) {
            this.text[i] = '';
            for (let j = 0; j < this.charCodes[i].length; j++) {
                this.text[i] += this.charAt(i,j);
            }
        }
    }
    get code () {
        let t = this.text.join(";\n");
        return compile_code (t);
    }
    
    autoCorrect () {
        if (!this.lineNumbers&&this.decoration )return;
        let l = this.text[this.cursor0].length;
        for (let i = this.text.length-1; i >=0; i--) {
            let t = this.text[i];
            t = t.replace(/\t/,' ');
            let u = (t.match(/^\s{0,}for/img)||'').length;
            t = t.replace(/^\s{0,}for /img,(new Array(u)).join(' ')+'Σ');
            t = t.replace(/(\d|\.)(e)([\+\-]{0,}\d)/,'$1ᴇ$3');
            t = t.replace(/\//g,"÷");
            t = t.replace(/!=/g,"≠");
            t = t.replace(/==/g,"=");
            t = t.replace(/(\s|\))and(\s|\()/g,"$1&&$2");
            t = t.replace(/(\s|\))or(\s|\()/g,"$1||$2");
            t = t.replace(/(\s|\))not(\s|\()/g,"$1!$2");
            t = t.replace(/<=/g,"≤");
            t = t.replace(/>=/g,"≥");
            t = t.replace(/;/g,",");
            t = t.replace(/dot/g,"⋅");
            t = t.replace(/cross/g,"×");
            t = t.replace(/\\|~|@/g,"");
            this.text[i] = t; 
        }
        let l2 = this.text[this.cursor0].length;
        this.populateCharCodes();
        this.select1=this.select3=this.cursor1=this.cursor1-(l-l2); 
        console.log(this.code);
    }
    get selection () {
        let t = "";
        for (let i = this.select0; i <= this.select2;i++) {
            let s = (i===this.select0?this.select1:0),
                e = (i===this.select2?this.select3:this.charCodes[i].length);
            for (let j = s; j < e;j++) {
                t += this.charAt(i,j);
            }
            if (i<this.select2) t += "\n";
        }
        return t;
    }
    set selection (input="") {
        this.addState();
        let value;
        if (typeof input === 'string') {
            if (this.preventNewLine) input = [input.replace(/\n/,'')];
            else input = input.split('\n');
            value = new Array(input.length);
            for (let i = 0; i < value.length; i++) {
                value[i] = new Array(input[i].length);
                for (let j = 0; j < value[i].length; j++) {
                    value[i][j] = charCode(input[i][j]);
                }
            }
        } else {
            value = [input];
        }
        let a = [[]];
        for (let i = 0; i <= this.select0; i++) {
            let e = i===this.select0?this.select1:this.charCodes[i].length;
            for (let j = 0; j < e; j++) {
                a[i].push(this.charCodes[i][j]);
            }
            if (i<this.select0) a.push([]);
        }
        for (let i = 0; i < value.length; i++) {
            for (let j = 0; j<value[i].length; j++) {
                a[a.length-1].push(value[i][j]);    
            }
            if (i<value.length-1) a.push([]);
        }
        for (let i = this.select2; i < this.charCodes.length; i++) {
            let s = i===this.select2?this.select3:0;
            let e = this.charCodes[i].length;
            for (let j = s; j < e; j++) {
                a[a.length-1].push(this.charCodes[i][j]);
            }
            if (i<this.charCodes.length-1) a.push([]);
        }
        this.charCodes = a;
        this.populateText();
        
        this.cursor0 = this.select0+value.length-1;
        if (value.length===1) this.cursor1 = this.select1+value[0].length;
        else this.cursor1 = value[value.length-1].length;
        this.select0 = this.cursor0;
        this.select1 = this.cursor1;
        this.select2 = this.cursor0;
        this.select3 = this.cursor1;
        
        
        this.autoCorrect();
    }
    get cursor0 () {return this.cursor[0];}
    set cursor0 (i) {
        this.cursor[0] = i;
        if (i*this.fontSize*1.5 < this.scroll_y ) this.scroll_y = i*this.fontSize*1.5;
        if (i*this.fontSize*1.5 > this.scroll_y+this.h-this.fontSize*1.5) this.scroll_y = (i+1)*this.fontSize*1.5-this.h;
    }
    get select0 () {return this.select[0];}
    set select0 (i) {this.select[0] = i;}
    get select2 () {return this.select[2];}
    set select2 (i) {this.select[2] = i;}
    get cursor1 () {return this.cursor[1];}
    set cursor1 (i) {
        if (i>=0) {
            let c = this.codeAt(this.cursor0,i);
            if (dummy(c)) {
                if (this.cursor1<i) i++;
                else i--;
            }
        }
        this.cursor[1] = i;
    }
    get select1 () {return this.select[1];}
    set select1 (i) {
        if (i>=0) {
            let c = this.codeAt(this.select0,i);
            if (dummy(c)) {
                if (this.select1<i) i++;
                else if (this.select1>i) i--;
            }
        }
        this.select[1] = i;
    }
    get select3 () {return this.select[3];}
    set select3 (i) {
        if (i>=0) {
            let c = this.codeAt(this.select2,i);
            if (dummy(c)) {
                if (this.select3<i) i++;
                else i--;
            }
        }
        this.select[3] = i;
    }
    handle (e, action ="down") {
        if (this.hidden) return;
        if (!this.editable) return;
        if (!this.active) return;
        let key = e.key.toLowerCase();
        this.keys[key] = action;
        if (key!=='r') e.preventDefault();
        if (e.getModifierState("CapsLock")) 
             this.keys.capslock = "down";
        else this.keys.caplsock = "up";
        
        if (this.keys.space=="down") key = " ";
        if (action == "up") return;
        if (key==="escape") {
            if (this.select0!==this.select2||this.select1!==this.select3) {
                this.select0 = this.cursor0;
                this.select1 = this.cursor1;
                this.select2 = this.cursor0;
                this.select3 = this.cursor1;
            }
        } else if (key==="capslock"||key==="alt"||key==="meta"||key==="control"||key==="contextmenu" || key==="pagedown" || key==="pageup" || key==="help" || (key.length > 1 && key[0]==="f")) {
            // do nothing  
        } else if (key==="shift") {
            if (this.keys["shift"]==="down") {
                if (this.cursor1<=this.select1) {
                    this.select1=this.cursor1;
                } else {
                    this.select3=this.cursor1;
                }
            }
        } else if (key === "home") {
		this.cursor1 = 0;
		this.select1 = this.cursor1;
		this.select3 = this.cursor1;
	} else if (key === "end") {
		this.cursor1 = this.text[this.cursor0].length;
		this.select1 = this.cursor1;
		this.select3 = this.cursor1;
	} else if (key==="backspace" || key==="delete") {
            if (key==="delete"&&this.select1===this.select3&&this.select0===this.select2) {
                let i = this.cursor1+1;
                if (i > this.text[this.cursor0].length && this.cursor0<this.text.length-1) {
                    this.cursor0 = Math.min(this.text.length-1,this.cursor0+1);
                    this.cursor1 = 0;
                } else if (i <= this.text[this.cursor0].length) this.cursor1 = i;
                if (this.keys.shift==="down") {
                    if (this.cursor0>this.select2||(this.cursor0===this.select2&&this.cursor1>this.select3)) {
                        this.select2 = this.cursor0;
                        this.select3 = this.cursor1;
                    } else {
                        this.select0 = this.cursor0;
                        this.select1 = this.cursor1;
                    }
                } else {
                    this.select0 = this.cursor0;
                    this.select1 = this.cursor1;
                    this.select2 = this.cursor0;
                    this.select3 = this.cursor1;
                }
            }
            if (this.select0!==this.select2||this.select1!==this.select3) {// Delete Selected
                this.selection = ""; 
            } else if (this.cursor1 === 0 && this.cursor0 > 0) { // nothing selected, beginning of line
                this.select0 -= 1;
                this.select1 = this.text[this.select[0]].length;
                this.selection = "";
            } else if (this.cursor1>0) { // nothing selected middle of line
                this.select1 = this.select1-1;
                this.selection = "";
            }
            this.select0 = this.cursor0;
            this.select1 = this.cursor1;
            this.select2 = this.cursor0;
            this.select3 = this.cursor1;
        } else if (key === "enter") { 
            let s = "\n";
            let m = this.text[this.select0].match(/^\s{0,}[?!\s]/);
            if (m) {
                let n = m[0].length+1;
                s += (new Array(m)).join(" ");
            }
            if (/^[^=]+\(.+\)*/g.test(this.text[this.select[0]])) s += " ";
            else if (/^[^=]+\[.+:.+\]*/g.test(this.text[this.select[0]])) s += " ";
            else if (/^\s{0,}(Σ|if|else)/g.test(this.text[this.select[0]])) s += " ";
            this.selection = s;
        } else if (key==="arrowleft") { 
            let i = this.cursor[1]-1;
            if (i < 0 && this.cursor[0]>0) {
                this.cursor0 = this.cursor0-1;
                this.cursor1 = this.text[this.cursor[0]].length;
            } else if (i >= 0) this.cursor1 = i;
            if (this.keys.shift==="down") {
                if (this.cursor0<this.select0||(this.cursor0===this.select0&&this.cursor1<this.select1)) {
                    this.select0 = this.cursor0;
                    this.select1 = this.cursor1;
                } else {
                    this.select2 = this.cursor0;
                    this.select3 = this.cursor1;
                }
            } else {
                this.select0 = this.cursor0;
                this.select1 = this.cursor1;
                this.select2 = this.cursor0;
                this.select3 = this.cursor1;
            }
        } else if (key==="arrowright") { 
            let i = this.cursor1+1;
            if (i > this.text[this.cursor0].length && this.cursor0<this.text.length-1) {
                this.cursor0 = Math.min(this.text.length-1,this.cursor0+1);
                this.cursor1 = 0;
            } else if (i <= this.text[this.cursor0].length) this.cursor1 = i;
            if (this.keys.shift==="down") {
                if (this.cursor0>this.select2||(this.cursor0===this.select2&&this.cursor1>this.select3)) {
                    this.select2 = this.cursor0;
                    this.select3 = this.cursor1;
                } else {
                    this.select0 = this.cursor0;
                    this.select1 = this.cursor1;
                }
            } else {
                this.select0 = this.cursor0;
                this.select1 = this.cursor1;
                this.select2 = this.cursor0;
                this.select3 = this.cursor1;
            }
        } else if (key==="arrowup") { 
            let i = this.cursor0-1;
            if (i >= 0) {
                this.cursor0 = i;
                this.cursor1 = Math.min(this.cursor1,this.text[this.cursor0].length);
            } else if (this.cursor1!==0) this.cursor1 = 0;
            if (this.keys["shift"]==="down") {
                if (this.cursor0<this.select0||(this.cursor0===this.select0&&this.cursor1<this.select1)) {
                    this.select0 = this.cursor0;
                    this.select1 = this.cursor1;
                } else {
                    this.select2 = this.cursor0;
                    this.select3 = this.cursor1;
                }
            } else {
                this.select0 = this.cursor0;
                this.select1 = this.cursor1;
                this.select2 = this.cursor0;
                this.select3 = this.cursor1;
            }
        } else if (key==="arrowdown") {
            let i = this.cursor[0]+1;
            if (i < this.text.length) {
                this.cursor0 = i;
                this.cursor1 = Math.min(this.cursor1,this.text[this.cursor0].length);
            } else if (this.cursor1 != this.text[this.cursor0].length) this.cursor1 = this.text[this.cursor0].length;
            if (this.keys.shift==="down") {
                if (this.cursor0>this.select2||(this.cursor0===this.select2&&this.cursor1>this.select3)) {
                    this.select2 = this.cursor0;
                    this.select3 = this.cursor1;
                } else {
                    this.select0 = this.cursor0;
                    this.select1 = this.cursor1;
                }
            } else {
                this.select0 = this.cursor0;
                this.select1 = this.cursor1;
                this.select2 = this.cursor0;
                this.select3 = this.cursor1;
            }
        } else if (this.keys.control==="down"||this.keys.meta==="down"){
            if (key==="1") {
                this.selection = "₁";
            }
            else if (key==="2") {
                this.selection = "₂";
            }
            else if (key==="3") {
                this.selection = "₃";
            }
            else if (key==="4") {
                this.selection = "₄";
            }
            else if (key==="c") {
                if (this.select0===this.select2&&this.select1===this.select3) 
                    this.select = [this.select0,0,this.select0,this.text[this.select0].length];
                navigator.clipboard.writeText(this.selection);
            }
            else if (key==="x") { 
                if (this.select0===this.select2&&this.select1===this.select3) 
                    this.select = [this.select0,0,this.select0,this.text[this.select0].length];
                navigator.clipboard.writeText(this.selection);
                this.selection = "";
            }
            else if (key==="v") {
                navigator.clipboard.readText().then(clipText => this.selection = clipText);
            }
            else if (key==="a") {
                this.cursor = [this.text.length-1,this.text[this.text.length-1].length];
                this.select = [0,0,this.text.length-1,this.text[this.text.length-1].length];
            }
            else if (key==="z") {
                if (this.keys["shift"]==="down") this.incrementState();
                else this.decrementState();
            }
            else if (key === "b" || key === "d") {
                this.selection = window.mostRecentChar;
            }
        } else if (key === "tab") {
            this.addState();
            if (this.keys.shift==="down") {
                for (let i = this.select0; i <= this.select2; i++) {
                    if (this.text[i][0]===' ') this.text[i] = this.text[i].substring(1);
                }
                this.select1 = Math.max(this.select1-1,0);
                this.select3 = Math.max(this.select3-1,0);
                this.cursor1 = Math.max(this.cursor1-1,0);
            } else {
                for (let i = this.select0; i <= this.select2; i++) {
                    this.text[i] = ' '+this.text[i];
                }
                this.select1++; this.select3++; this.cursor1++;
            }
            this.populateCharCodes();
        } else {
            if (key === "(") {
                this.selection = "("+this.selection+")";
                this.cursor1 = this.cursor1-1;
                this.select1 = this.cursor1;
                this.select3 = this.cursor1;
           } else if (key === "{") {
                this.selection = "{"+this.selection+"}";
                this.cursor1 = this.cursor1-1;
                this.select1 = this.cursor1;
                this.select3 = this.cursor1;
           } else if (key === "[") {
                this.selection = "["+this.selection+"]";
                this.cursor1 = this.cursor1-1;
                this.select1 = this.cursor1;
                this.select3 = this.cursor1;
           } else {
                if (this.keys.shift==="down"||(this.keys.capslock==="down"&&this.keys.shift!=="down")) 
                    key = key.toUpperCase();
                this.selection = key;
           }
        }
    }
    wheel (e) {
        let x = e.offsetX-this.x, y = e.offsetY-this.y;
        if (x < this.w && x >= 0 && y < Math.max(this.h,this.height*1.5*this.fontSize) && y >= 0) {
            this.scroll_y = Math.max(Math.min(this.scroll_y+e.deltaY,this.actual_height-this.h),0);
            //this.scroll_x = Math.max(Math.min(this.scroll_x+e.deltaX,this.actual_width-this.w),0);
        }
    }
    mouse (e, action = "start") {
        if (this.hidden) return;
        if (this.scroll_mouse || (this.actual_height > this.h &&
            this.vertical_scroll.x < e.offsetX && e.offsetX < this.vertical_scroll.x+this.vertical_scroll.w &&
            this.vertical_scroll.y < e.offsetY && e.offsetY < this.vertical_scroll.y+this.vertical_scroll.h)) {

            if (action === "start") {this.scroll_mouse = e.offsetY; this.old_scroll_y = this.scroll_y;}
            if (this.scroll_mouse && action === "move") {
                this.scroll_y = Math.max(Math.min(this.old_scroll_y+(e.offsetY-this.scroll_mouse)*this.ctx.dpr,this.actual_height-this.h),0);
            }
            if (action === "end") {this.scroll_mouse = false;}
            this.canvas.style.cursor = "pointer";
            return;
        }
        
        this.prevSelect = [this.select0,this.select1,this.select2,this.select3];
        let x = e.offsetX-this.x, y = e.offsetY-this.y;
        if (x < this.w && x >= 0 && y < Math.max(this.h,this.height*1.5*this.fontSize) && y >= 0) {
            this.canvas.style.cursor = "text";
            if (action==="start") {
                this.active = true;
                window.activeTextBox = this;
            }
        } else {
            if (action==="start") {
                this.active = false;
                this.keys = {};
            }
        }
        y = (y+this.scroll_y-15/20*this.fontSize)/(1.5*this.fontSize)-.25;
        y = Math.ceil(y);
        let i = Math.min(Math.max(y,0),this.text.length-1);
        let ctx = this.ctx;
        ctx.font = this.fontSize + "px Courier New";
        x -= (this.x_offset)*this.fontSize*.6-this.scroll_x;
        let j = 0, dx = 0;
        for (let k = 0; k < this.text[i].length; k++) {
            let ddx = this.measurements[i][k];
            if (dx<x&&x<dx+ddx) {j=k;break;}
            dx += ddx;
            if (k === this.text[i].length-1) {
                if (x < 0) j = 0;
                else j = this.text[i].length;
            }
        }
        if (action === "start" && this.active) {
            this.mouse_down = true;
            this.cursor0 = i;
            this.cursor1 = j;
            this.ancor = [this.cursor0,this.cursor1];
            this.select0 = this.cursor0;
            this.select1 = this.cursor1;
            this.select2 = this.cursor0;
            this.select3 = this.cursor1;
        }
        if (action === "end") {
            this.mouse_down = false;
        }
        if (action === "move" && this.mouse_down === true && this.active) {
            this.cursor = [i,j];
            if (i < this.ancor[0]||(i===this.ancor[0]&&j<this.ancor[1])) {
                this.select0 = i;
                this.select1 = j;
                this.select2 = this.ancor[0];
                this.select3 = this.ancor[1];
            } else {
                this.select0 = this.ancor[0];
                this.select1 = this.ancor[1];
                this.select2 = i;
                this.select3 = j;
            }
        }
    }
    circle (ctx,x,y,r) {
      ctx.beginPath();
      ctx.arc(x, y-1*ctx.lineWidth, r, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x,y-r-1.5*ctx.lineWidth);
      ctx.lineTo(x,y-14*r-.5*ctx.lineWidth);
      ctx.stroke();
     }
    draw (ctx) {
        if (this.hidden) return;
        this.time += 1/60;
        if (!this.active) this.move(0,.02*Math.sin(.25*this.time));
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.time+=1/60;
        let time = .2*this.time;
        let text = this.text, x = this.x, y = this.y, cursor = this.cursor, ch = this.canvas.height/ctx.dpr;
        // Measure Box, (needs scroll?)
        let h = this.height*this.fontSize*1.5,
            w = this.width*this.fontSize*.6,
            ah = 0, aw = 0;
        for (let i = 0; i < this.measurements.length; i++) {
            let dw = 0;
            for (let j = 0; j < this.measurements[i].length; j++) {
                dw += this.measurements[i][j];
            }
            aw = Math.max(dw,aw);
        }
        ah = this.fontSize * 1.5 * this.measurements.length;
        this.h = h;
        this.w = w;
        this.actual_height = ah;
        this.actual_width = aw;
        // Vertical Scroll
        if (h < ah) {
            this.vertical_scroll = {
                w : this.w*(3/100),
                h : this.h*(h/ah),
                x : this.x + this.w*(97/100),
                y : this.y + this.scroll_y*h/ah
            }
            ctx.fillStyle = rgba(.7,.8,.9,.9);
            ctx.fillRect(this.vertical_scroll.x,this.vertical_scroll.y,this.vertical_scroll.w,this.vertical_scroll.h);
        }
        // Horizontal Scroll
        if (w < aw) {
            this.horizontal_scroll = {
                w : this.w*(w/aw),
                h : this.h*(3/100),
                x : this.x + this.scroll_x*w/aw,
                y : this.y + this.h*(97/100)
            }
            ctx.fillStyle = rgba(.7,.8,.9,.9);
            ctx.fillRect(this.horizontal_scroll.x,this.horizontal_scroll.y,this.horizontal_scroll.w,this.horizontal_scroll.h);
        }
        // Draw Box : 
            let grd = ctx.createLinearGradient(this.x,this.y,this.x,this.y+Math.max(ch*10/100,this.h));
            grd.addColorStop(0,rgba(0.1,0.2,0.3,.8));
            grd.addColorStop(1,rgba(0.1,0.2,0.3,.7));
            ctx.fillStyle = grd;
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = -2;
            ctx.shadowOffsetY = 5;
            ctx.shadowColor = "black";
            ctx.fillRect(x,y,w,h);
        // ctx.shadowColor = "transparent";
        if (this.decoration) {
            grd = ctx.createLinearGradient(this.x,this.y,this.x,this.y+Math.max(ch*10/100,this.h));
            grd.addColorStop(0,rgba(0.7+0.3*Math.sin(time),0,0.7-0.3*Math.sin(time),.8));
            grd.addColorStop(0.5,rgba(0.7+0.3*Math.sin(time+1.5),0,0.7-0.3*Math.sin(time+1.5),.4));
            grd.addColorStop(1,rgba(0.7+0.3*Math.sin(time+3),0,0.7-0.3*Math.sin(time+3),0));
            ctx.fillStyle = grd;
            ctx.fillRect(x,y,this.fontSize*1.5,h);
        }
        
        let cursor_x = 0;
        // Write Text :
        this.measurements = new Array(text.length);
        for (let i = 0, l = text.length; i < l; i++) {
            this.measurements[i] = new Array(text[i].length);
            ctx.fillStyle = rgba(1,1,1,.8);
            let pt = "\t";
            if (this.lineNumbers) { pt = i; for (let k = 0; k < 3-(i+'').length; k++) pt += '\t';}
            else if (this.decoration) pt = "\t\t\t";
            let t = pt + text[i];
            let dx = 0;
            let comment = false;
            for (let j = 0; j < t.length; j++) {
                let dt = t[j];
                let dum = false;
                if (j+1<t.length&&isDummy(t[j+1])) {dt+=t[++j];dum=true;}
                if (t[j]==='#') {comment = true;}
                let ss = t.substring(j);
                let sn = /^\.?\d+\.?\d{0,}(ᴇ[\+\-]?\d{0,})?/.exec(ss);
                let container = (dt==="{"||dt==="}"||dt==="("||dt===")"||dt==="["||dt==="]");
                if (/^else(\s|$)/.test(ss)) {dt = "else";j+=3;ctx.font = (this.fontSize*.8) + "px Courier New";}
                else if (/^if(\s|\()/.test(ss)) {dt = "if";j+=1;ctx.font = (this.fontSize*.9) + "px Courier New";}
                else if (container||dt==='Σ') ctx.font = (this.fontSize*1.6) + "px Courier New";
                else {
                    if (sn) {dt = sn[0]; j+= dt.length-1;}
                    ctx.font = this.fontSize + "px Courier New";
                }
                if (comment) ctx.fillStyle = rgba(1,1,1,.4);
                else if (sn&&j-dt.length>0&&(/[\*\><\=\s\+\-\|\(\[\{\,\&\^\≠\≥\≤\÷\:]/.exec(t[j-dt.length]))) {
                    ctx.fillStyle = rgba(.8,.6,1,1);  
                } else if (container||dt===",") {
                  ctx.fillStyle = rgba(1,.3,.3,1);  
                } else if (dt==="Σ"||dt==="else"||dt==="if"||dt==="*"||dt==="|"||dt==="&"||dt==="^"||dt==="×"||dt==="⋅"||dt==="="||dt==="<"||dt===">"||dt==="≠"||dt==="≥"||dt==="≤"||dt==="÷"||dt==="+"||dt==="-"||dt===":") {
                    ctx.fillStyle = rgba(1,.5,.3,1);
                } else {
                    ctx.fillStyle = rgba(1,.9,.8,.8);
                }
                let tx = x-this.scroll_x+(5/20)*this.fontSize+dx,
                    ty = y-this.scroll_y+(i+.25+10/20) * 1.5*this.fontSize
                if (ty-this.fontSize*.75>this.y && ty<this.y+this.h) {
                    ctx.fillText(dt, tx, ty);
                    let ddx = ctx.measureText(dt).width;
                    if (j>=pt.length) for (let k = 0; k < dt.length; k++) {
                        this.measurements[i][j-pt.length-dt.length+k+1] = ddx/dt.length; 
                    }
                    dx += ddx;
                }
                
            }
            ctx.fillStyle = rgba(1,1,1,.5);
            ctx.strokeStyle = rgba(1,1,1,.5*(.8+0.1*Math.sin(time)));
            ctx.lineWidth = 2/ctx.dpr;
            for (let j = 0; j < this.text[i].length; j++) if (this.text[i][j]===` `||this.text[i][j]===`\t`) {
                let cx = x-this.scroll_x+.6*(j+pt.length+1)*this.fontSize,
                    cy = y-this.scroll_y+(i+.7) * 1.5*this.fontSize;
                if (cy>this.y && cy<this.y+this.h)
                    this.circle(ctx,cx,cy,this.fontSize*.1);
            }
            else break;
            
        }
        if (this.active) {
            // Draw cursor 
            let dx = 0;
            for (let i = 0; i < this.cursor1; i++) dx += this.measurements[this.cursor0][i];
            ctx.fillStyle = rgba(1,1,1,.5*(.8+0.2*Math.sin(20*time)));
            ctx.fillRect(x-this.scroll_x-1+dx+this.x_offset*this.fontSize*.6,y-this.scroll_y+1.5*this.fontSize*(this.cursor0+1),2,-1.5*this.fontSize);
            if (this.select2!==this.select0||this.select3!==this.select1)
            for (let i = this.select2; i >= this.select0; i--) {
                let s = (i===this.select0)?(this.select1):0;
                let e = (i===this.select2)?(this.select3):this.text[i].length;
                let dx = 0, dw = 0;
                for (let j = 0; j < s; j++) dx += this.measurements[i][j];
                for (let j = s; j < e; j++) dw += this.measurements[i][j];
                ctx.fillStyle = rgba(1,1,1,.5);
                let sx = x-this.scroll_x-1+dx+this.x_offset*this.fontSize*.6,
                    sy = y-this.scroll_y+1.5*this.fontSize*(i+1);
                if (sy > this.y && sy < this.y+this.h)
                    ctx.fillRect(sx,sy,Math.max(dw,this.fontSize*.3),-1.5*this.fontSize);
            }
        }
        ctx.shadowColor = "transparent";
    }
    
    get value () {
        return this.text.join("\n");
    }
    set value (txt) {
        this.addState();
        this.text = txt.split("\n");
        this.cursor0 = 0;
        this.cursor1 = 0;
        this.select0 = this.cursor0;
        this.select1 = this.cursor1;
        this.select2 = this.cursor0;
        this.select3 = this.cursor1;
        this.autoCorrect();
    }
    
    
    constructor (text = '', x, y, w, h, lineNumbers = true, decoration = lineNumbers, fontSize=20, preventNewLine = false, editable = true) {
        this.hidden = false;
        this.scroll_y = 0;
        this.scroll_x = 0;
        this.text = text.split('\n');
        this.measurements = [];
        this.populateCharCodes();
        this.x = x;
        this.y = y;
        this.w = w;
        this.width = w/fontSize/.6;
        this.h = h;
        this.height = h/fontSize/1.5;
        this.editable = editable;
        this.lineNumbers = lineNumbers;
        this.decoration = decoration;
        this.active = false;
        this.fontSize = fontSize;
        this.preventNewLine = preventNewLine;
        this.x_offset = 1.5;
        if (this.lineNumbers||this.decoration) this.x_offset = 3.5;
        this.cursor = [0,0];
        this.select = [0,0,0,0];
        this.cursor0 = 0;
        this.cursor1 = 0;
        this.select0 = this.cursor0;
        this.select1 = this.cursor1;
        this.select2 = this.cursor0;
        this.select3 = this.cursor1;
        this.state_stack = [];
        this.state_index = 0;
        this.keys = {};
        this.time = 100*Math.random();
        this.mouse_down = false;
        this.autoCorrect();
    }
}
