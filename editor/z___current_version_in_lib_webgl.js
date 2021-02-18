/*

    WEBGL UTILITY FUNCTIONS

*/

// Makes a buffer to render to.
class Framebuffer {
    // webgl, texture number [0-7], number of destinations [1-4], data type (float/unsignedbyte), width, height
    constructor(gl, n, n_tex ,type, w, h = w) {
        this.gl = gl;
        this.type = type;
        this.n = n;
        this.n_tex = n_tex;
        this.w = w;
        this.h = h;
        this.width = w;
        this.height = h;
        this.fb0 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb0);
        this.renderbuffer = gl.createRenderbuffer();
        this.texture = new Array(this.n_tex);
        for (let i = 0; i < this.n_tex; i++) {
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
    write(typedArray) {
        this.gl.activeTexture(this.gl["TEXTURE" + this.n]);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.w, this.h, 0, this.gl.RGBA, this.type, typedArray);
    }
    source(element) {
        this.gl.activeTexture(this.gl["TEXTURE" + this.n]);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, element);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
    }
    route() {
        this.gl.activeTexture(this.gl["TEXTURE" + this.n]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture[0]);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb0);
        this.gl.viewport(0, 0, this.w, this.h);
    }
}
// Creates graphics program using <script> tag id
const createProgram = (gl, vstr, fstr) => {
    vstr = vstr.length < 20 && document.getElementById(vstr) ? document.getElementById(vstr).textContent : vstr
    fstr = fstr.length < 20 && document.getElementById(fstr) ? document.getElementById(fstr).textContent : fstr
    fstr = document.getElementById('common').textContent + fstr;
    let program = gl.createProgram()
    let vshader = createShader(gl, vstr, gl.VERTEX_SHADER)
    let fshader = createShader(gl, fstr, gl.FRAGMENT_SHADER)

    gl.attachShader(program, vshader)
    gl.attachShader(program, fshader)
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
    return program;
}
// helper for creating program
const createShader = (gl, str, type) => {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, str)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    	var errorString = gl.getShaderInfoLog(shader);
        alert(errorString + str.split('\n')[errorString.split(':')[2]-1]);
        throw gl.getShaderInfoLog(shader);
    }

    return shader;
}
// must be called on at least one program to initialize vertices
const initAttrib = (gl, program) => {
    gl.useProgram(program);
    let attrib = gl.getAttribLocation(program, 'av');
    gl.enableVertexAttribArray(attrib);
    gl.vertexAttribPointer(attrib, 2, gl.FLOAT, gl.FALSE, 0, 0);
    return program;
}
// set uniform value for a program
const setUni = (gl, program, name, args, int = false) => {
    gl.useProgram(program);
    if (!program[name]) program[name] = gl.getUniformLocation(program, name);
    if (args.constructor == Framebuffer) gl.uniform1i(program[name], args.n+int);
    else if (int || typeof (args) == "boolean") gl.uniform1i(program[name], args);
    else if (args.constructor == Array) gl["uniform" + args.length + "fv"](program[name], args);
    else if (typeof (args) == "number") gl.uniform1f(program[name], args);
    return setUni;
}
// write a program to a destination
const draw = (gl, program, dest, type = gl.TRIANGLES, a = 0, b = 6, clear = true) => {
    gl.useProgram(program);
    if (dest.route == undefined) {
    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, dest.width, dest.height);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, dest.fb0);
        let drawBuffers = new Array(dest.n_tex);
        for (let i = 0; i < dest.n_tex; i++) {
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
}
// create vertices
const initVerts = (gl, w = 0, h = w) => {
    let arr = new Float32Array(w * h * 2 + 12), sqr = [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1], i = 0;
    for (j = 0; j < 12; j++) arr[i++] = sqr[j];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            arr[i++] = x / w;
            arr[i++] = y / h;
        }
    }
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    return arr;
}