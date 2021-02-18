/*

    WebGL

*/
const getExtensions = (gl) => {
    ext = gl.getExtension('EXT_texture_float'),
	lin = gl.getExtension('EXT_texture_float_linear'),
	dbf = gl.getExtension('WEBGL_draw_buffers'),
	fco = gl.getExtension('EXT_color_buffer_float');
};
class Texture {
    
    constructor (gl, n, w, h, type=gl.FLOAT) {
        this.n = n; // Location
        this.w = w; // width
        this.h = h; // height
        this.type = type; // FLOAT UNSIGNED_BIT
        this.texture = gl.createTexture();
        gl.activeTexture(gl['TEXTURE' + n]);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        this.format = gl.RGBA32F;
        if (this.type != gl.FLOAT) this.format = gl.RGBA;
        gl.texImage2D(gl.TEXTURE_2D, 0, this.outs[i].format, this.w, this.h, 0, gl.RGBA, gl.FLOAT, null);
    }
    
}
class Vector {
    set index (x) {this.index = x;}
    get index () {return this.index;}
    get glsl () {
        return `
            vec4 `+this.name+`
        `;
    }
    constructor (name, dim, w, h, n, index=0) {
        this.name = name;
        this.dim = dim; // 4D dimensions
        this.w = w; // buffer width
        this.h = h; // buffer height
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
        const suffix = `xyzw`;
        // create struct 
        s = `struct STRUCT_IN {
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
            let endCh = Math.floor((v.index+v.n)/4);
            let startV = (v.index-4*startCh)%4;
            let endV = Math.min(startV+v.n,4);
            s +=`vec4 GET` + v.name + `(vec4 x) {
                 vec4 o = vec(0.0);
                 o.`;
            for (let j = 0; j < endV-startV; j++) {
                s += suffix[j];
            }
            s += ` = GET_IN_` + startCh + `(x, iR4D` + v.name + `, iR` + v.name + `).`;
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
                s += ` = GET_IN_` + endCh + `(x, iR4D` + v.name + `, iR` + v.name + `).`;
                for (let j = startV; j < endV; j++) {
                    s += suffix[j];
                }
                s += `;
                `;
            }
            s += `;
                return o;
                }`;
        }
        // getter for whole set
        s += `
            GET_IN_ALL (vec4 x) {
                return STRUCT_IN (`;
        for (let i = 0; i < this.vector.length; i++) {
            let v = this.vector[i];
            s += `GET_IN_ `+v.name+`(x)`;
            if (i < this.vector.length-1) {
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
        s = `struct STRUCT_OUT {
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
            let endCh = Math.floor((v.index+v.n)/4);
            let startV = (v.index-4*startCh)%4;
            let endV = Math.min(startV+v.n,4);
            s +=`OUT` + startCh + `.`;
            for (let j = startV; j < endV; j++) {
                s += suffix[j];
            }
            s += ` = psi.`;
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
                s += ` = psi.`;
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
        this.dim = vectors[i];
        for (let i = 0, l = vectors.length; i < l; i++) {
            let v = vectors[i];
            v.index = index;
            index += v.n;
        }
    }
}
class Shader {
    setUni (gl, name, args, int = false) {
        gl.useProgram(this.program);
        if (!program[name]) program[name] = gl.getUniformLocation(program, name);
        if (args.constructor == Texture) {
            gl.activeTexture(gl["TEXTURE" + args.n]);
            gl.bindTexture(gl.TEXTURE_2D, args.texture);
            gl.uniform1i(this.program[name], args.n);
        }
        else if (int || typeof (args) == "boolean") gl.uniform1i(this.program[name], args);
        else if (args.constructor == Array) gl["uniform" + args.length + "fv"](this.program[name], args);
        else if (typeof (args) == "number") gl.uniform1f(this.program[name], args);
    }
    draw (gl) {
        gl.useProgram(this.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        let drawBuffers = new Array(4);
        for (let i = 0; i < 4; i++) {
            drawBuffers[i] = gl.COLOR_ATTACHMENT0+i;
            gl.activeTexture(gl["TEXTURE" + (dest.n+i)]);
            gl.bindTexture(gl.TEXTURE_2D, this.outs[i]);
        }
        gl.viewport(0, 0, this.w, this.h);
        gl.drawBuffers(drawBuffers);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
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
            alert(errorString + str.split('\n')[errorString.split(':')[2]-1]);
            throw gl.getShaderInfoLog(shader);
        }
        return shader;
    }
    /*
        gl = webgl2 context
        =fs = glsl str
        ins, outs = [3,1,4..]
        dim = [1024, 1024] ..
    */
    constructor (gl, fs, ins, outs, dim) {
        this.ins = ins;
        this.outs = outs;
        this.dim = dim;
        if (dim.length == 1) {
            this.w = dim[0];
            this.h = 1;
        }
        if (dim.length == 2) {
            this.w = dim[0];
            this.h = dim[1];
        }
        if (dim.length == 3) {
            this.w = dim[0]*dim[2];
            this.h = dim[1];
        }
        if (dim.length == 4) {
            this.w = dim[0]*dim[2];
            this.h = dim[1]*dim[3];
        }
        const vs = `#version 300 es
		    in vec2 _V;
		    void main () {gl_Position = vec4(_V*2.-1., 0, 1);}`;
		fs = `#version 300 es
    		#ifdef GL_FRAGMENT_PRECISION_HIGH
    			precision highp float;
    		#else
    			precision mediump float;
    		#endif
    		#define _U gl_FragCoord.xy;
    		layout(location = 0) out vec4 OUT0
    		layout(location = 1) out vec4 OUT1
    		layout(location = 2) out vec4 OUT2
    		layout(location = 3) out vec4 OUT3
    		uniform sampler2D IN0;
    		uniform sampler2D IN1;
    		uniform sampler2D IN2;
    		uniform sampler2D IN3;
    		#define Main void main ()
    		ivec4 _24 (ivec2 u, ivec4 iR4D, ivec2 iR) {
    		    u = u%iR;
    			int i = u.x+iR.x*u.y;
    			ivec4 v = ivec4 (
    				i%iR4D.x,
    				(i/iR4D.x)%iR4D.y,
    				(i/(iR4D.x*iR4D.y))%iR4D.z,
    				i/(iR4D.x*iR4D.y*iR4D.z)
    			);
    			return v;
    		}
    		ivec2 _42 (ivec4 v, ivec4 iR4D, ivec2 iR) {
    		    v = v%iR4D;
    			int i = v.w*iR4D.x*iR4D.y*iR4D.z;
    			i+=v.z*iR4D.x*iR4D.y;
    			i+=v.y*iR4D.x+v.x;
    			return ivec2(i%iR.x,i/iR.x);
    		}
    		#define GET_IN0(x,iR4D,iR) texelFetch(IN0,_42(ivec4(x),iR4D,iR))
    		#define GET_IN1(x,iR4D,iR) texelFetch(IN1,_42(ivec4(x),iR4D,iR))
    		#define GET_IN2(x,iR4D,iR) texelFetch(IN2,_42(ivec4(x),iR4D,iR))
    		#define GET_IN3(x,iR4D,iR) texelFetch(IN3,_42(ivec4(x),iR4D,iR))
    		vec4 vec(float x) {return vec4(x,0,0,0);}
    		vec4 vec(float x, float y) {return vec4(x,y,0,0);}
    		vec4 vec(float x, float y, float z) {return vec4(x,y,z,0);}
    		vec4 vec(float x, float y, float z, float w) {return vec4(x,y,z,w);}
    		
		`+fs;
        this.program = this.creatProgram(gl, vs, fs);
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.renderbuffer = gl.createRenderbuffer();
        this.ins = new Array(4);
        this.outs = new Array(4);
        for (let i = 0; i < 4; i++) {
            this.ins[i] = new Texture(gl, i, gl.FLOAT);
            
            this.outs[i] = new Texture(gl, 4+i, gl.FLOAT);
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i, gl.TEXTURE_2D, this.outs[i].texture, 0);
        }
        if (!gl.vertexActivated) {
            gl.vertexActivated = true;
            let arr = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1]);
            let buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
            gl.useProgram(this.program);
            let attrib = gl.getAttribLocation(this.program, 'av');
            gl.enableVertexAttribArray(attrib);
            gl.vertexAttribPointer(attrib, 2, gl.FLOAT, gl.FALSE, 0, 0);
        }
    }
    
}

