const shader_root = `#version 300 es
    #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
    #else
        precision mediump float;
    #endif
    #define Main void main ()
    #define LOOKUP(tx,u) texelFetch((tx),ivec2(u),0)
    #define _i42(u, iR4) ivec4((u)%(iR4).xy,(u)/(iR4).xy)
    #define _i24(v,iR4D) ivec2((v).xy+(v).zw*(iR4D).xy)
    #define _42(u,R4D) vec4(_i42(ivec2(u),ivec4(R4D)))
    #define _24(u,R4D) vec2(_i24(ivec4(u),ivec4(R4D)))
    vec4 vec(float x) {return vec4(x,0,0,0);}
    vec4 vec(float x, float y) {return vec4(x,y,0,0);}
    vec4 vec(float x, float y, float z) {return vec4(x,y,z,0);}
    vec4 vec(float x, float y, float z, float w) {return vec4(x,y,z,w);}
    vec4 vec(int x) {return vec4(x,0,0,0);}
    vec4 vec(int x, int y) {return vec4(x,y,0,0);}
    vec4 vec(int x, int y, int z) {return vec4(x,y,z,0);}
    vec4 vec(int x, int y, int z, int w) {return vec4(x,y,z,w);}
    vec4 vec(vec2 x) {return vec4(x,0,0);}
    vec4 vec(vec3 x) {return vec4(x,0);}
    vec4 vec(vec4 x) {return x;} 
    uniform vec2 R_;
    uniform vec4 R4_;
    uniform float time;
    uniform vec4 mouse;
    `
const vs_root = shader_root + `
    in vec2 _V;
    out vec2 V_;
    `
const fs_root = shader_root + `
    in vec2 V_;
    #define U_ gl_FragCoord.xy
`;
const vertex_shader = (outs=[],ins=[],vs='',uniforms={}) => {
    let s = vs_root;
    for (let i = 0; i < ins.length; i++) 
        s += `uniform sampler2D tx_`+ins[i].name+`;
              uniform vec2 R_`+ins[i].name+`;
              uniform vec4 R4_`+ins[i].name+`;
              out vec4 V_`+ins[i].name+`;
              #define get_`+ins[i].name+`(u) LOOKUP(tx_`+ins[i].name+`,_24(u,R4_`+ins[i].name+`))
        `;
    for (let uniform in uniforms) {
        s += `uniform vec4 `+uniforms[uniform];
    }
    s += `
            Main {
                V_=_V;
                vec4 P_= vec(_V);
        ` 
    for (let i = 0; i < ins.length; i++) {
        s +=   `V_`+ins[i].name+`= LOOKUP(tx_`+ins[i].name+`,V_*R_`+ins[i].name+`);
                vec4 P_`+ins[i].name+`= _42(V_*R_`+ins[i].name+`,R4_`+ins[i].name+`);
                `
    }
    s += vs + `
                gl_Position = vec4(P_.xy*2.-1.,P_.z-1., 1);
            }
        `
    return s;
}
const fragment_shader = (outs=[],ins=[],fs='',uniforms={}) => {
    let s = fs_root;
    for (let i = 0; i < outs.length; i++) 
        s += `layout(location = `+i+`) out vec4 `+ outs[i].name +`;`
    for (let i = 0; i < ins.length; i++) 
        s += `uniform sampler2D tx_`+ins[i].name+`;
              uniform vec2 R_`+ins[i].name+`;
              uniform vec4 R4_`+ins[i].name+`;
              in vec4 V_`+ins[i].name+`;
              #define get_`+ins[i].name+`(u) LOOKUP(tx_`+ins[i].name+`,_24(u,R4_`+ins[i].name+`))
        `;
    for (let uniform in uniforms) {
        s += `uniform vec4 `+uniforms[uniform];
    }
    s += `Main {
            vec4 U4_ = vec4(_42(U_,R4_));
            ` + fs + `
        }`
    return s;
}
class Texture {
    route(i=0) {
        this.gl.activeTexture(this.gl["TEXTURE" + i]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.viewport(0, 0, this.w, this.h);
    }
    write(typedArray) {
        this.route();
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.w, this.h, 0, this.gl.RGBA, this.type, typedArray);
    }
    source(element) {
        this.route();
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, element);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
    }
    toArray (x=0,y=0,dx=this.w,dy=this.h) {
        this.route();
        let pixels = new Float32Array(this.w * this.h * 4);
        this.gl.readPixels(x,y,dx,dy, this.gl.RGBA, this.gl.FLOAT, pixels);
        return pixels;
    }
    toUint8Array (x=0,y=0,dx=this.w,dy=this.h) {
        this.route();
        let pixels = new Uint8Array(this.w * this.h * 4);
        this.gl.readPixels(x,y,dx,dy, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        return pixels;
    }
    clear (gl=this.gl) {
        this.route();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    constructor (gl, w, h, type=gl.FLOAT) {
        this.gl = gl;
        this.w = w;
        this.h = h;
        this.type = type;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        let format = gl.RGBA32F;
        if (this.type != gl.FLOAT) format = gl.RGBA;
        gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, gl.RGBA, this.type, null);
    }
}
class Framebuffer {
    constructor (gl, textures) {
        this.gl = gl;
        this.textures = textures;
        this.w = 0;
        this.h = 0;
        for (let i = 0; i < textures.length; i++) {
            let v = textures[i];
            if (v.w>this.w) this.w = v.w;
            if (v.h>this.h) this.h = v.h;
        }
        this.width = this.w;
        this.height = this.h;
        this.nBuffers = textures.length;
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);

        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.w, this.h);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    } 
}
const draw = (gl, program, dest, a = 0, b = 6, clear = false, type = gl.TRIANGLES) => {
    gl.useProgram(program);
    if (dest.constructor === Framebuffer) {
        let drawBuffers = new Array(dest.nBuffers);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dest.framebuffer);
        for (let i = 0; i < drawBuffers.length; i++) {
            drawBuffers[i] = gl.COLOR_ATTACHMENT0+i;
            dest.textures[i].route(4+i);
            gl.bindTexture(gl.TEXTURE_2D, dest.textures[i].texture);
            gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, drawBuffers[i], gl.TEXTURE_2D, dest.textures[i].texture, 0);
        }
        gl.drawBuffers(drawBuffers);
    } else gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,dest.width||dest.w,dest.height||dest.w);
    if (clear) gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (b>6) type = gl.POINTS;
    gl.drawArrays(type, a, b);
}
const setUni = (gl, program, name, args, int = false) => {
    gl.useProgram(program);
    if (!program[name]) program[name] = gl.getUniformLocation(program, name);
    if (args.constructor == Texture) {
        args.route(int);
        gl.uniform1i(program[name], int);
    }
    else if (int || typeof (args) == "boolean") gl.uniform1i(program[name], args);
    else if (args.constructor == Array) gl["uniform" + args.length + "fv"](program[name], args);
    else if (typeof (args) == "number") gl.uniform1f(program[name], args);
    return setUni;
};
const getWebGL = (canvas) => {
    let 
    gl = canvas.getContext('webgl2',{antialias: false}),
    ext = gl.getExtension('EXT_texture_float'),
    lin = gl.getExtension('EXT_texture_float_linear'),
    dbf = gl.getExtension('WEBGL_draw_buffers'),
    fco = gl.getExtension('EXT_color_buffer_float');
    gl.canvas = canvas;
    return gl;
};
const createProgram = (gl, vstr, fstr) => {
    let program = gl.createProgram();
    let vshader = createShader(gl, vstr, gl.VERTEX_SHADER);
    let fshader = createShader(gl, fstr, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
    program.vs = vstr;
    program.fs = fstr;
    return program;
};
const createShader = (gl, str, type) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var errorString = gl.getShaderInfoLog(shader);
        str = str.split('\n');
        for (let i = 0; i < str.length; i++) {
            str[i] = (i+1)+str[i];
        }
        str = str.join('\n');
        console.log(str+errorString + '\nError : '+str.split('\n')[errorString.split(':')[2]-1]);
        throw gl.getShaderInfoLog(shader);
    }
    return shader;
};

const createVertices = (gl, mesh) => {
    let program = createProgram(gl,vertex_shader(),fragment_shader());
    let sqr = [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1];
    let arr = new Float32Array(sqr.concat(mesh));
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.useProgram(program);
    let attrib = gl.getAttribLocation(program, '_V');
    gl.enableVertexAttribArray(attrib);
    gl.vertexAttribPointer(attrib, 2, gl.FLOAT, gl.FALSE, 0, 0);
    return arr;
};
class Vector {
    get texture () {
        return this.textures[this.current%this.textures.length];
    }
    next () {
        this.current++;
    }
    display (gl=this.gl) {
        gl.canvas.width = this.w;
        gl.canvas.height = this.h;
        setUni(gl,this.display_program,"IN0",this.texture,0);
        draw(gl,this.display_program,gl.canvas);
    }
    toArray (gl=this.gl) {
        return this.texture.toArray();
    }
    clear (gl=this.gl) {
        this.texture.clear(gl);
    }
    constructor (gl, name, n, dim) {
        this.gl = gl;
        this.name = name; 
        this.dim = dim.concat(); // 4D dimensions
        this.dim[0] = Math.max(this.dim[0],1);
        this.dim[1] = Math.max(this.dim[1],1);
        this.dim[2] = Math.max(this.dim[2],1);
        this.dim[3] = Math.max(this.dim[3],1);
        this.w = this.dim[0]*this.dim[2]; // buffer width
        this.h = this.dim[1]*this.dim[3]; // buffer height
        this.n = n; // number of elements
        this.current = 0;
        this.textures = [
            new Texture (gl, this.w, this.h),
            new Texture (gl, this.w, this.h)
        ];
        let fs = ``;
        if (this.n == 1) fs = `rgba = vec4(rgba);`;
        else if (this.n < 4) fs = `rgba.w = 1.;`;
        fs = `rgba = LOOKUP(tx_`+this.name+`,U_);`+fs;
        fs = fragment_shader([{name:'rgba'}],[this],fs);
        
        this.display_program = createProgram (gl, vertex_shader(), fs);
    }
}
class Shader {
    draw (gl=this.gl, uniforms={}, clear) {
        for (let name in uniforms) setUni(gl, this.program, name, uniforms[name]);
        setUni(gl, this.program, 'R_', [this.w,this.h]);
        setUni(gl, this.program, 'R4_', this.dim);
        for (let i = 0; i < this.ins.length; i++) {
            setUni(gl, this.program, 'tx_'+this.ins[i].name, this.ins[i].texture,i);
            setUni(gl, this.program, 'R_'+this.ins[i].name, [this.ins[i].w,this.ins[i].h]);
            setUni(gl, this.program, 'R4_'+this.ins[i].name, this.ins[i].dim);
        }
        for (let i = 0; i < this.outs.length; i++) {
            for (let j = 0; j < this.ins.length; j++) 
                if (this.ins[j].name === this.outs[i].name) 
                    this.outs[i].next();
            this.framebuffer.textures[i] = this.outs[i].texture;
        }
        draw (gl, this.program, this.framebuffer, this.vertStart, this.vertEnd, clear==="clear");
    }
    constructor (gl, vs, fs, ins, outs, vertStart=0, vertEnd=6) {
        this.gl = gl;
        this.copyIn = [];
        this.copyOut = [];
        this.ins = ins;
        this.outs = outs;
        this.vertStart = vertStart;
        this.vertEnd = vertEnd;
        this.dim = outs[0].dim;
        this.w = outs[0].w;
        this.h = outs[0].h;
        this.height = this.h;
        this.width = this.w;
        this.vs = vertex_shader(outs,ins,vs);
        this.fs = fragment_shader(outs,ins,fs);
        this.program = createProgram(gl, this.vs, this.fs);
        let textures = new Array(outs.length);
        for (let i = 0; i < textures.length; i++) textures[i] = outs[i].texture;
        this.framebuffer = new Framebuffer (gl, textures);
    }
}
class Set {
    mesh () {
        if (this.dim[2]>1) return 'must be 2D set';
        let w = this.dim[0], h = this.dim[1],
            arr = new Array(w * h * 6), sqr = [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1], i = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                for (let k = 0; k < 6; k++) {
                    arr[i++] = (x+sqr[k*2+0]) / w;
                    arr[i++] = (y+sqr[k*2+1]) / h;
                }
            }
        }
        return arr;
    }
    points () {
        let w = Math.max(1,this.dim[0])*Math.max(1,this.dim[2]), h = Math.max(1,this.dim[1])*Math.max(1,this.dim[3]),
            arr = new Array(w * h * 2 ), i = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                arr[i++] = (x) / w;
                arr[i++] = (y) / h;
            }
        }
        return arr;
    };
    constructor(gl,name,vectors,dim) {
        this.gl = gl;
        this.vectors = [];
        this.dim = dim;
        for (let v in vectors) {
            this[v] = new Vector(gl,name+v,vectors[v],dim);
            this.vectors.push(this[v]);
        }
    }
}
