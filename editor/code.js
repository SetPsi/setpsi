if (!Array.prototype.substring) {
    Array.prototype.substring = function(start, end) {
        return this.slice(start, end);
    };
}
class Tree {
    get text () {
        let s = '';
        for (let i = 0; i < this.a.length; i++) {
            if (this.a[i].constructor === Tree) s += this.a[i].text;
            else s += this.a[i];
        }
        return s;
    }
    constructor(s) {
        this.s = s;
        this.a = [];
        for (let i = 0; i < s.length; i++) {
            this.a.push(s[i]);
            let count = 0;
            let j = i;
            if (s[i]==="(") {
                for (j = j; j < s.length; j++) {
                    if (s[j]==="(") count++;
                    if (s[j]===")") count--;
                    if (count===0) break;
                }
                this.a.push(new Tree(s.substring(i+1,j)));
                i = j-1;
            }
            if (s[i]==="[") {
                for (j = j; j < s.length; j++) {
                    if (s[j]==="[") count++;
                    if (s[j]==="]") count--;
                    if (count===0) break;
                }
                this.a.push(new Tree(s.substring(i+1,j)));
                i = j-1;
            }
            if (s[i]==="{") {
                for (j = j; j < s.length; j++) {
                    if (s[j]==="{") count++;
                    if (s[j]==="}") count--;
                    if (count===0) break;
                }
                this.a.push(new Tree(s.substring(i+1,j)));
                i = j-1;
            }
        }
        for (let i = 0; i < this.a.length; i++) {
            if (this.a[i].constructor !== Tree) {
                if (this.a[i] === '⋅'||this.a[i] === '×') {
                    let left = [], right = [], count;
                    count = 0;
                    for (let j = i-1; j >= 0; j--) {
                        if (this.a[j]===")") count++;
                        if (this.a[j]==="(") count--;
                        if (count < 1 && (
                            this.a[j]==="("||
                            this.a[j]==="["||
                            this.a[j]==="{"||
                            this.a[j]==="="||
                            this.a[j]==="+"||
                            this.a[j]==="-")) {
                            break;
                        } else {
                            left.unshift(this.a[j]);
                        }
                    }
                    for (let j = i+1; j < this.a.length; j++) {
                        if (this.a[j]==="(") count++;
                        if (this.a[j]===")") count--;
                        if (count < 1 && (
                            this.a[j]===")"||
                            this.a[j]==="]"||
                            this.a[j]==="}"||
                            this.a[j]==="="||
                            this.a[j]==="+"||
                            this.a[j]==="-")) {
                            break;
                        } else {
                            right.push(this.a[j]);
                        }
                    }
                    let pre = [..."vec(dot("];
                    if (this.a[i]==='×') pre = [..."vec(cross("];
                    this.a[i] = ',';
                    this.a.splice(i+1,right.length,new Tree(right.concat([..."))"])));
                    this.a.splice(i-left.length,left.length,new Tree(pre.concat(left)));
                }
            }
        }
    }
}

const compile_code = (t) => {
    t = t.replace(/(?<!\.)(\d+)(?!\.)/g,'$1.0');
    t = t.replace(/(ᴇ[\+\-]?\d+)\.0/,'$1');
    t = t.replace(/ᴇ/,'e');
    t = t.replace(/#/,'//');
    t = t.replace(/\{(.+)\}/g,'vec($1)');
    t = t.replace(/Σ[\s]{0,}([^\s,]+)[\s]{0,}=[\s]{0,}([\+\-]{0,}[\d]{0,}(?:\.[\d]{0,})?)[\s\,]{0,}([^\s,]+)[\s\,]{0,}([<>≤≥])[\s\+]{0,}([\+\-]{0,}\d+(?:\.\d+)?|.)(?!(\.|\d)+)[\s\,]{0,}([^\s,]+)\s{0,}([\+\-=]+)([\+\-]{0,}\d+(?:\.\d+)?)[:\s]{0,}/g,'for ( float $1=$2; $3$4$5 ; $7$8$9 ) {');
    t = t.replace(/Σ[\s]{0,}([^\s,]+)[\s]{0,}=[\s]{0,}([\+\-]{0,}[\d]{0,}(?:\.[\d]{0,})?)[\s\,]{0,}([^\s,]+)[\s\,]{0,}([<>≤≥])[\s\+]{0,}([\+\-]{0,}\d+(?:\.\d+)?|.)(?!(\.|\d)+)[\s\,]{0,}([^\s,]+)\s{0,}([\+\-])([\+\-]?)[:\s]{0,}/g,'for ( float $1=$2; $3$4$5 ; $7$8$8 ) {');
    t = t.replace(/Σ[\s]{0,}([^\s,]+)[\s]{0,}=[\s]{0,}([\+\-]{0,}[\d]{0,}(?:\.[\d]{0,})?)[\s\,]{0,}([^\s,]+)[\s\,]{0,}([<>≤≥])[\s\+]{0,}([\+\-]{0,}\d+(?:\.\d+)?|.)(?!(\.|\d)+)[:\s]{0,}/g,'for ( float $1=$2; $3$4$5 ; $1++ ) {');
    t = t.replace(/Σ[\s]{0,}([^\s,]+)[\s\,]{0,}([<≤])[\s\+]{0,}([\+\-]{0,}\d+(?:\.\d+)?|.)(?!(\.|\d)+)[:\s]{0,}/g,'for ( float $1=0; $1$2$3 ; $1++ ) {');
    t = t.replace(/if (.[^:]{0,}):?\s{0,};\n/g,'if ($1) {\n');
    t = t.replace(/(if.+)=(.+\n)/g,'$1==$2');
    t = t.replace(/÷/g,"/");
    t = t.replace(/≤/g,"<=");
    t = t.replace(/≥/g,">=");
    t = t.replace(/≠/g,"!=");
    
    t = t.replace(/((?<![\.\d])[^\.\:\;\d\*\><\=\s\+\-\|\(\[\{\}\]\)\,\&\^\/][^\.\:\;\*\><\=\s\+\-\|\(\[\{\}\]\)\,\&\^\/₁₂₃₄]{0,})([₁₂₃₄]+)/g,'vec($1.$2)');
    t = t.replace(/₁/g,'x');
    t = t.replace(/₂/g,'y');
    t = t.replace(/₃/g,'z');
    t = t.replace(/₄/g,'w');
    let tree = new Tree(t);
    t = tree.text;

    for (let i = 0; i < t.length; i++) {
        let cc = t.charCodeAt(i);
        if (cc > 125) t = t.replace(t[i],"_"+cc);
    }
    let stack = [];
    t = t + "\n\n";
    t = t.split('\n');
    let ns = 0;
    for (let i = 0; i< t.length; i++) {
        let s = /^\s{0,}/g.exec(t[i])[0].length+
                (t[i].match(/{/g)||[]).length-
                (t[i].match(/}/g)||[]).length;
        let dns = ns-s;
        ns = s;
        for (let j = 0; j < dns; j++) t[i] = "}"+t[i];
    }
    t = t.join('\n');
    
    // Find unique variables
    let tokens = t.match(/(?<![\.\d])[^\.\:\;\d\*\><\=\s\+\-\|\(\[\{\}\]\)\,\&\^\/][^\.\:\;\*\><\=\s\+\-\|\(\[\{\}\]\)\,\&\^\/]{0,}/g);
    let tokenMap = {};
    for (let i = 0; i < tokens.length; i++) {
        let tok = tokens[i];
        if (!/^vec|sin|exp|cos|atan|tan|smoothstep|step|for|float|dot|length|cross$/.test(tok)) {
            let r = new RegExp ('float\\s\+' + tok);
            if (!r.test(t)) tokenMap[tok] = tok;
        }
    }
    for (let token in tokenMap) {
        t = "vec4 "+token+";\n"+t;
    }

    return t;
};