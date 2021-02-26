window.onload = () => {
    const
        canvas_webgl = document.getElementById("canvas-webgl"),
        canvas_2d    = document.getElementById("canvas-2d"),
        ctx = canvas_2d.getContext('2d'),
	editor = new Editor( canvas_2d ),
        gl = getWebGL(canvas_webgl);
    document.getElementById('error').style.display = 'none';
    canvas_webgl.width = 512;
    canvas_webgl.height = 512; 
    const fs =`
	    vec2 z = (U_-0.5*R_)/R_.y+vec2(-.8,.2);
	    vec4 w = vec4(0);
	    vec2 c = vec2(-.77+.05*sin(.1*time),.2+.2*sin(.2666*time));
	    for (float i = 0.; i < 100.; i++) {
	        z = vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
	        float d = length(z)-1.6;
	        w += 2e-2*exp(-6.*d*d)+2e-2*exp(-2.*dot(z,z)-.001*i*i);
	        if (length(z)>4.) {
	            Q = vec(w);
	            break;
	        }
	    }
	`,
	Q = new Set (gl, '', {Q:1},[canvas_webgl.width,canvas_webgl.height,0,0]);
	const uniforms = {
	    mouse : [0,0,0,0],
	    time : 0
	},
	julia = new Shader (gl, ``,fs,[],[Q.Q]),
	vertices = createVertices(gl,[]);
	
    window.onresize = () => {
    	ctx.dpr = window.devicePixelRatio || 1;
      	canvas_2d.height = window.innerHeight*ctx.dpr;
       	canvas_2d.width  = window.innerWidth *ctx.dpr;
	canvas_2d.style.width = (canvas_2d.width/ctx.dpr) + "px";
	canvas_2d.style.height = (canvas_2d.height/ctx.dpr) + "px";
       	ctx.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    };
    window.onresize();
    
    const animate = () => {
	    requestAnimationFrame ( animate );
	    let t = performance.now();
	    editor.draw (ctx);
	    uniforms.time += 1/60;
	    julia.draw(gl,uniforms);
	    Q.Q.display();
	    ctx.shadowBlur = 15;
            ctx.shadowOffsetX = -2;
            ctx.shadowOffsetY = 5;
            ctx.shadowColor = "black";
            let cw = canvas_2d.width/ctx.dpr, ch = canvas_2d.height/ctx.dpr,
            x = ch*(16/100), h = ch*(25/100), w = h*(canvas_webgl.height/canvas_webgl.width), y = ch*40/100;
	    ctx.drawImage(canvas_webgl,x,y,w,h);
            ctx.shadowColor = "transparent";
	    //console.log(performance.now()-t);
    };
    animate () ;
	
};
