/*

    WebGL

*/
const vs_root = `#version 300 es
    in vec2 _V;
    void main () {gl_Position = vec4(_V*2.-1., 0, 1);}`;
const fs_root = `#version 300 es
	#ifdef GL_FRAGMENT_PRECISION_HIGH
		precision highp float;
	#else
		precision mediump float;
	#endif
	layout(location = 0) out vec4 OUT0;
	layout(location = 1) out vec4 OUT1;
	layout(location = 2) out vec4 OUT2;
	layout(location = 3) out vec4 OUT3;
	#define _U gl_FragCoord.xy
	uniform sampler2D IN0;
	uniform sampler2D IN1;
	uniform sampler2D IN2;
	uniform sampler2D IN3;
	uniform float time;
	uniform vec2 mouse;
	#define Main void main ()
	ivec4 _24 (ivec2 u, ivec4 iR4D, ivec2 iR) {
	    u = u%iR;
		int i = u.x+iR.x*u.y;
		iR4D = max(iR4D,ivec4(1));
		ivec4 v = ivec4 (
			i%iR4D.x,
			(i/iR4D.x)%iR4D.y,
			(i/(iR4D.x*iR4D.y))%iR4D.z,
			i/(iR4D.x*iR4D.y*iR4D.z)
		);
		return v;
	}
	ivec2 _42 (ivec4 v, ivec4 iR4D, ivec2 iR) {
		int i = v.w*iR4D.x*iR4D.y*iR4D.z;
		i+=v.z*iR4D.x*iR4D.y;
		i+=v.y*iR4D.x+v.x;
		return ivec2(i%iR.x,i/iR.x);
	}
	#define GET_IN0(x,iR4D,iR) texelFetch(IN0,_42(ivec4(x),iR4D,iR),0)
	#define GET_IN1(x,iR4D,iR) texelFetch(IN1,_42(ivec4(x),iR4D,iR),0)
	#define GET_IN2(x,iR4D,iR) texelFetch(IN2,_42(ivec4(x),iR4D,iR),0)
	#define GET_IN3(x,iR4D,iR) texelFetch(IN3,_42(ivec4(x),iR4D,iR),0)
	vec4 vec(float x) {return vec4(x,0,0,0);}
	vec4 vec(float x, float y) {return vec4(x,y,0,0);}
	vec4 vec(float x, float y, float z) {return vec4(x,y,z,0);}
	vec4 vec(float x, float y, float z, float w) {return vec4(x,y,z,w);}
	vec4 vec(vec2 x) {return vec4(x,0,0);}
	vec4 vec(vec3 x) {return vec4(x,0);}
	vec4 vec(vec4 x) {return x;}
	
`;
const getExtensions = (gl) => {
    ext = gl.getExtension('EXT_texture_float'),
	lin = gl.getExtension('EXT_texture_float_linear'),
	dbf = gl.getExtension('WEBGL_draw_buffers'),
	fco = gl.getExtension('EXT_color_buffer_float');
};
class Vector {
    set index (x) {this.i = x;}
    get index () {return this.i;}
    constructor (name, dim, w, h, n, index=0) {
        this.name = name; 
        this.dim = dim; // 4D dimensions
        this.w = w; // buffer width
        this.h = h; // buffer height
        this.i = index;
        this.ndim = 0; 
        for (let i = 0; i < 4; i++) {
            if (this.dim[i] === 0) break;
            else this.ndim++;
        }
        this.n = n; // number of elements
        this.index = index; // index of first element
    }
}
class Set {
    get glsl_in () {
        if (this.vectors.length < 1) return ``;
        const suffix = `xyzw`;
        // create struct 
        let s = `struct STRUCT_IN {
            `;
        for (let i = 0; i < this.vectors.length; i++) {
            let v = this.vectors[i];
            s +=`vec4 ` + v.name + `;
            `;
        }
        s += `};
        `;
        // define dimensions
        for (let i = 0; i < this.vectors.length; i++) {
            let v = this.vectors[i];
            s += `#define iR4D`+v.name+` ivec4(`+v.dim[0]+`,`+v.dim[1]+`,`+v.dim[2]+`,`+v.dim[3]+`) 
                  #define iR`  +v.name+` ivec2(`+v.w+`,`+v.h+`)
                `;
        }
        // define getters (complicated because a vector could need multiple lookups)
        for (let i = 0; i < this.vectors.length; i++) {
            let v = this.vectors[i];
            let startCh = Math.floor(v.index/4);
            let endCh = Math.floor((v.index+v.n-1)/4);
            let startV = (v.index-4*startCh)%4;
            let endV = Math.min(startV+v.n,4);
            s +=`vec4 GET` + v.name + `(vec4 x) {
                 vec4 o = vec(0.0);
                 o.`;
            for (let j = 0; j < endV-startV; j++) {
                s += suffix[j];
            }
            s += ` = GET_IN` + startCh + `(x, iR4D` + v.name + `, iR` + v.name + `).`;
            for (let j = startV; j < endV; j++) {
                s += suffix[j];
            }
            s += `;
            `;
            if (endCh !== startCh) {
                endV = v.n - (endV-startV);
                startV = 0;
                s += `o.`;
                for (let j = 0; j < endV-startV; j++) {
                    s += suffix[j];
                }
                s += ` = GET_IN` + endCh + `(x, iR4D` + v.name + `, iR` + v.name + `).`;
                for (let j = startV; j < endV; j++) {
                    s += suffix[j];
                }
                s += `;
                `;
            }
            s += `return o;
                }
                `;
        }
        // getter for whole set
        s += `
            STRUCT_IN GET_IN_ALL (vec4 x) {
                return STRUCT_IN(`;
        for (let i = 0; i < this.vectors.length; i++) {
            let v = this.vectors[i];
            s += `GET`+v.name+`(x)`;
            if (i < this.vectors.length-1) {
                s += `,`;
            }
        }
        s += `);
            }
        `;
        return s;
    }
    get glsl_out () {
        const suffix = `xyzw`;
        // create struct 
        let s = `struct STRUCT_OUT {
            `;
        for (let i = 0; i < this.vectors.length; i++) {
            let v = this.vectors[i];
            s +=`vec4 ` + v.name + `;
            `;
        }
        s += `};
        `;
        // create output setter
        s += `
            void SET_OUT (STRUCT_OUT psi) {
                `;
        for (let i = 0; i < this.vectors.length; i++) {
            let v = this.vectors[i];
            let startCh = Math.floor(v.index/4);
            let endCh = Math.floor((v.index+v.n-1)/4);
            let startV = (v.index-4*startCh)%4;
            let endV = Math.min(startV+v.n,4);
            s +=`OUT` + startCh + `.`;
            for (let j = startV; j < endV; j++) {
                s += suffix[j];
            }
            s += ` = psi.`+v.name+`.`;
            for (let j = 0; j < endV-startV; j++) {
                s += suffix[j];
            }
            s += `;
            `;
            if (endCh !== startCh) {
                endV = v.n - (endV-startV);
                startV = 0;
                s += `OUT`+endCh+`.`;
                for (let j = startV; j < endV; j++) {
                    s += suffix[j];
                }
                s += ` = psi.`+v.name+`.`;
                for (let j = 0; j < endV-startV; j++) {
                    s += suffix[j];
                }
                s += `;
                `;
        }
        }
        s += `
            }
        `;
        return s;
    }
    constructor (vectors) {
        this.vectors = vectors;
        let index = 0;
        this.w = 0;
        this.h = 0;
        this.dim = [0,0,0,0];
        for (let i = 0, l = vectors.length; i < l; i++) {
            let v = vectors[i];
            if (v.w>this.w) this.w = v.w;
            if (v.h>this.h) this.h = v.h;
            for (let i = 0; i < 4; i++) if (v.dim[i]>this.dim[i]) this.dim[i] = v.dim[i];
            v.index = index;
            index += v.n;
        }
        this.nBuffers = Math.ceil(index/4);
    }
}
class Framebuffer {
    constructor (gl, n, w, h, nBuffers=4, type=gl.FLOAT) {
        this.gl = gl;
        this.type = type;
        this.n = n;
        this.w = w;
        this.h = h;
        this.nBuffers = nBuffers;
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.renderbuffer = gl.createRenderbuffer();
        this.texture = new Array(4);
        for (let i = 0; i < 4; i++) {
            this.texture[i] = gl.createTexture();
            gl.activeTexture(gl['TEXTURE' + (this.n+i)]);
            gl.bindTexture(gl.TEXTURE_2D, this.texture[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            let format = gl.RGBA32F;
            if (this.type != gl.FLOAT) format = gl.RGBA;
            gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, gl.RGBA, this.type, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i, gl.TEXTURE_2D, this.texture[i], 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
        }
    } 
}
const draw = (gl, program, dest, type = gl.TRIANGLES, a = 0, b = 6, clear = false) => {
    gl.useProgram(program);
    if (dest.constructor !== Framebuffer) {
    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, dest.width, dest.height);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, dest.framebuffer);
        let drawBuffers = new Array(dest.nBuffers);
        for (let i = 0; i < drawBuffers.length; i++) {
            drawBuffers[i] = gl.COLOR_ATTACHMENT0+i;
            gl.activeTexture(gl["TEXTURE" + (dest.n+i)]);
            gl.bindTexture(gl.TEXTURE_2D, dest.texture[i]);
            gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i, gl.TEXTURE_2D, dest.texture[i], 0);

        }
        gl.viewport(0, 0, dest.w, dest.h);
        gl.drawBuffers(drawBuffers);
        
    }
    if (clear) gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.drawArrays(type, a, b);
};
const setUni = (gl, program, name, args, int = false) => {
    gl.useProgram(program);
    if (!program[name]) program[name] = gl.getUniformLocation(program, name);
    if (args.constructor == Framebuffer) gl.uniform1i(program[name], args.n+int);
    else if (int || typeof (args) == "boolean") gl.uniform1i(program[name], args);
    else if (args.constructor == Array) gl["uniform" + args.length + "fv"](program[name], args);
    else if (typeof (args) == "number") gl.uniform1f(program[name], args);
    return setUni;
};
class Shader {
    draw (gl, uniforms) {
        for (let i = 0; i < this.loaders.length; i++) this.load(gl,i);
        for (let name in uniforms) {
            setUni(gl, this.program, name, uniforms[name]);
        }
        for (let i = 0; i < 4; i++) setUni(gl, this.program, 'IN'+(i), this.inFramebuffer, i);
        if (this.outs.constructor === Set) draw (gl, this.program, this.outFramebuffer);
        else                               draw (gl, this.program, this.outs);

        //let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
        //gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        //console.log(pixels);
    }
    createProgram (gl, vstr, fstr) {
        let program = gl.createProgram();
        let vshader = this.createShader(gl, vstr, gl.VERTEX_SHADER);
        let fshader = this.createShader(gl, fstr, gl.FRAGMENT_SHADER);
        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(program);
        }
        return program;
    }
    createShader (gl, str, type) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        	var errorString = gl.getShaderInfoLog(shader);
            console.log(errorString + '\nError : '+str.split('\n')[errorString.split(':')[2]-1]);
            throw gl.getShaderInfoLog(shader);
        }
        return shader;
    }
    load (gl,index) {
        let loader = this.loaders[index];
        for (let i = 0; i < 4; i++) setUni(gl, loader.program, 'IN'+(i), loader.shader.outFramebuffer, i);
        draw(gl, loader.program, this.inFramebuffer);
        
        //let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
        //gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        //console.log(pixels);
    }
    createLoader (gl, shader, inStart, vector) {
        const suffix = `xyzw`;
        let fs = fs_root;
        fs += `#define R4D ivec4(` + this.ins.dim[0] + `,` + this.ins.dim[1] + `,` +  this.ins.dim[2] + `,` + this.ins.dim[3] + `)
		       #define _R ivec2(`+ this.ins.w+`,`+this.ins.h+`)
		`;
    	fs += this.ins.glsl_out;
    	fs += `Main {
    		vec4 chi = vec4(_24(ivec2(_U),R4D,_R));
    		STRUCT_OUT psi;
    		vec4 in0 = GET_IN0(chi,R4D,_R);
    		vec4 in1 = GET_IN1(chi,R4D,_R);
    		vec4 in2 = GET_IN2(chi,R4D,_R);
    		vec4 in3 = GET_IN3(chi,R4D,_R);
    		`;
    	for (let i = 0; i < vector.n; i++) {
    	    fs += `psi.`+ vector.name + `.` + suffix[i] + `= in` + Math.floor((i+inStart)/4) + `.` + suffix[(i+inStart)%4] + `;
    	    `; 
    	}
    	fs += ` 
    		SET_OUT(psi);
    	}`;
        //console.log(fs);
        let loader = {
            program : this.createProgram(gl,this.vs,fs),
            shader : shader
        };
        this.loaders.push(loader);
        
    }
    /*
        gl = webgl2 context
        =fs = glsl str
        ins, outs = [3,1,4..]
        dim = [1024, 1024] ..
    */
    constructor (gl, fs, ins, outs, dim) {
        this.loaders = [];
        this.ins = ins;
        this.outs = outs;
        this.dim = dim;
        this.uniforms = {};
        let ndim = 0;
        for (let i = 0; i < 4; i++) {
            if (dim[i]>0) ndim++;
            else break;
        }
        if (ndim == 1) {
            this.w = dim[0];
            this.h = 1;
        }
        if (ndim == 2) {
            this.w = dim[0];
            this.h = dim[1];
        }
        if (ndim == 3) {
            this.w = dim[0]*dim[2];
            this.h = dim[1];
        }
        if (ndim == 4) {
            this.w = dim[0]*dim[2];
            this.h = dim[1]*dim[3];
        }
        this.fs = fs_root;
        this.vs = vs_root;
		this.fs += this.ins.glsl_in;
		this.fs += `#define R4D ivec4(` + this.dim[0] + `,` + this.dim[1] + `,` + this.dim[2] + `,` + this.dim[3] + `)
		    #define _R ivec2(`+this.w+`,`+this.h+`)
		`;
		if (this.outs.glsl_out !== undefined) {
    		this.fs += this.outs.glsl_out;
    		this.fs += `Main {
    		        vec4 chi = vec4(_24(ivec2(_U),R4D,_R));
    		        STRUCT_OUT psi;
    		      ` + fs + `
    		        SET_OUT(psi);
    		      }
    		      `;
		} else {
		    let n = this.ins.vectors[0].n;
		    let s = ``;
		    if (n == 1) s = `
		    OUT0 = vec4(OUT0.x);`;
		    else if (n < 4) s = `
		    OUT0.w = 1.;`;
		    this.fs += `
		       Main {
		        vec4 chi = vec4(_24(ivec2(_U),R4D,_R));
		        OUT0 = GET`+this.ins.vectors[0].name+`(chi);`+s+`
		       }
		    `;
		}
		//console.log(this.fs);
        this.program = this.createProgram(gl, this.vs, this.fs);
        
        this.inFramebuffer = new Framebuffer (gl, 0, this.w, this.h,ins.nBuffers);
        this.outFramebuffer = new Framebuffer (gl, 4, this.w, this.h,outs.nBuffers);
        
        
        if (!gl.vertexActivated) {
            gl.vertexActivated = true;
            let arr = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1]);
            let buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
            gl.useProgram(this.program);
            let attrib = gl.getAttribLocation(this.program, '_V');
            gl.enableVertexAttribArray(attrib);
            gl.vertexAttribPointer(attrib, 2, gl.FLOAT, gl.FALSE, 0, 0);
        }
    }
    
}