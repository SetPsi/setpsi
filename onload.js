window.onload = () => {	
	let
	// Find canvas element :
		canvas = document.getElementById('canvas'),
	// Load webgl and extensions :
		gl = canvas.getContext('webgl2'),
		ext = gl.getExtension('EXT_texture_float'),
		lin = gl.getExtension('EXT_texture_float_linear'),
		dbf = gl.getExtension('WEBGL_draw_buffers'),
		fco = gl.getExtension('EXT_color_buffer_float'),
	// Create data buffer array (assinged in mode function below) :
		fbo = [   ],
	// codeBoxes
		// CodeMirror configuration :
		config = {lineNumbers: true,mode:"text/x-csrc", scrollbarsStyle: "native"},
		codeBoxes = [  ], // assinged in mode function below
		codeEditors = [  ], // assinged in mode function below
		showCode = document.getElementById('Show'),
		showEditor = CodeMirror.fromTextArea(showCode, config),
		_ = showEditor.setSize(700,130),
	// Programs :
		out = createProgram(gl, "vs", "out"), // Show program
		programs = [], // programs array 
	// Create vertices, just a square to display the whole screen :
		verts = initVerts(gl),
	// Initialize attribute (tells the vertex shader how to read the coordinates provided)
		attrib = initAttrib (gl, out),
	// Initalize input variables :
		mouse = [0,0,0,0], time = 0, I = 0, MODE = 1,
	// PASS DATA : Function to set the input variables to the shader : 
		setUnis = (program) => {
			// Tells the program the size of the data buffer and canvas :
				setUni(gl, program, "R", [canvas.width, canvas.height]);
				setUni(gl, program, "Rs", [fbo[0].width, fbo[0].height]);
			// Update time :
				setUni(gl, program, "time", time);
			// Integer frame value. +1 each time the simulation loop cycles :
				setUni(gl, program, "I", I, true);
			// Mode (1 v and y)
				setUni(gl, program, "MODE", MODE, true);
			// Passes the mouse data along :
				setUni(gl, program, "mouse", mouse);
			// Input variable for the size of the 1D simulation
				setUni(gl, program, "N", Number(document.getElementById('N_value').value)+1);
				setUni(gl, program, "dt_value", Number(document.getElementById('dt_value').value));
		},
	// SIMULATION : Function to run the simulation one step through the program chain
		doSim = () => {
			for (let i = 0; i < programs.length; i++) {
				setUnis(programs[i]);
				for (let j = 0; j < 3; j++) // pass along the parallel states (up to 4, typically 1, each one provieds 4 channels)
					setUni(gl, programs[i], "texture"+j, fbo[i%2], j%fbo[i%2].n_tex);
				draw(gl,programs[i],fbo[1-(i%2)]); // run the program!
			}
			if (programs.length%2==1) fbo = [fbo[1],fbo[0]]; // if there's an odd number of programs, we have to swap the buffers so that fbo[0] is always the last computed buffer
		},
	// DISPLAY : Function output to the screen :
		doRender = () => {
			setUnis(out); 
			for (let i = 0; i < fbo[0].n_tex; i++) setUni(gl, out, "texture"+i, fbo[0], i);
			draw(gl, out, canvas);
		},
	// FRAME : Called 60 times per second, runs the simulation loop and displays to the screen :
		frame = (n) => {
			// Run simulation 'n' times :
			for (let i = 0; i < n; i++) {
	        	doSim();
	        	I++;
				time += 1/60;
	        }
	        // Display :
	        doRender();
			// Display time :
			let t = Math.round(time)/10;
			if (t == Math.round(t)) t = t.toString() + '.0';
			document.getElementById('time_display').innerHTML = t;
		},
	// COMPILE : Function to insert code from code boxes and compile the shader programs :
		compile = () => {
			time = 0; I = 0;
			let a = document.getElementById("A").textContent,
			    o = document.getElementById("out").textContent;
			if (showEditor != null) out = createProgram(gl, "vs", o.replace("//INSERT", showEditor.getValue()));
			for (let i = 0; i < codeEditors.length; i++) {
				if (codeEditors[i] != null) {
					programs[i] = createProgram(gl, "vs", a.replace("//INSERT", codeEditors[i].getValue()));
				}
			}
			frame(2);
		},
	// ANIMATEION loop, runs the 'frame' function 60 times per second :
		animate = () => {
		    requestAnimationFrame(animate);
	        let n = Number(document.getElementById('iters').value);
	        if (isNaN(n)) n = 2;
	        // Fit codeboxes to code content.
	        	const hpl = 15;
		        for (let i = 0; i < codeEditors.length; i++) 
		        	codeEditors[i].setSize(700, hpl*codeEditors[i].getValue().split('\n').length+1.5*hpl);
		        	showEditor.setSize(700, hpl*showEditor.getValue().split('\n').length+1.5*hpl);
	        frame(n);
		},
	// MODE : Set Mode
		alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		mode = (n_dim, n_stage, use_v_z, display_show_code, variables = 1) => {
			MODE = use_v_z;
			if (display_show_code) {
				document.getElementById("show").style.display = "inline";
				document.getElementById("show_check").checked = true;
			} else {
				document.getElementById("show").style.display = "none";
				document.getElementById("show_check").checked = false;
			}
			progDiv = document.getElementById('programs');
			progDiv.innerHTML = "<br>";
			programs = new Array (n_stage);
			codeBoxes = new Array (n_stage);
			codeEditors = new Array (n_stage);
			for (let i = 0; i < n_stage; i++) {
				if (n_stage>1) progDiv.innerHTML += alphabet[i] + " : ";
				progDiv.innerHTML += "<textarea id='"+alphabet[i]+"_code'></textarea>";
				programs[i] = createProgram(gl, "vs","A");
			}
			for (let i = 0; i < n_stage; i++) {
				codeBoxes[i] = document.getElementById(alphabet[i]+"_code");
				codeEditors[i] = CodeMirror.fromTextArea(codeBoxes[i], config);
				codeEditors[i].setSize(700,130);
			}
			if (n_dim == 1) {
				fbo = [
					new Framebuffer (gl, 0, variables, gl.FLOAT, canvas.width, 3),
					new Framebuffer (gl, 3, variables, gl.FLOAT, canvas.width, 3)
				];
				document.getElementById('width').onchange = () => {
					canvas.width = Number(document.getElementById('width').value);
					fbo = [
						new Framebuffer (gl, 0, variables, gl.FLOAT, canvas.width, 3),
						new Framebuffer (gl, 3, variables, gl.FLOAT, canvas.width, 3)
					];
					document.getElementById('N_value').max = canvas.width;
				}
				document.getElementById('height').onchange = () => {
					canvas.height = Number(document.getElementById('height').value);
				}
			} else {
				fbo = [
					new Framebuffer (gl, 0, variables, gl.FLOAT, canvas.width, canvas.height),
					new Framebuffer (gl, 3, variables, gl.FLOAT, canvas.width, canvas.height)
				];
				document.getElementById('width').onchange = () => {
					canvas.width = Number(document.getElementById('width').value);
					fbo = [
						new Framebuffer (gl, 0, variables, gl.FLOAT, canvas.width, canvas.height),
						new Framebuffer (gl, 3, variables, gl.FLOAT, canvas.width, canvas.height)
					];
					document.getElementById('N_value').max = canvas.width;
				}
				document.getElementById('height').onchange = () => {
					canvas.height = Number(document.getElementById('height').value);
					fbo = [
						new Framebuffer (gl, 0, variables, gl.FLOAT, canvas.width, canvas.height),
						new Framebuffer (gl, 3, variables, gl.FLOAT, canvas.width, canvas.height)
					];
				}
			}
		};
		// global function so buttons can send code and mode
		window.button = (info) => {
			if (!info.n_psi) info.n_psi = 1;
			if (!info.n_dim) info.n_dim = 1;
			if (!info.use_v_z) info.use_v_z = false;
			if (typeof info.display_show_code !== "boolean") info.display_show_code = true;
			if (!info.sim_code) info.sim_code = [''];
			info.n_stage = info.sim_code.length;
			if (!info.show_code) info.show_code = false;
			mode(info.n_dim, info.n_stage, info.use_v_z, info.display_show_code, info.n_psi);
			for (let i = 0; i < info.n_stage; i++) {
				codeEditors[i].setValue(info.sim_code[i]);
			}
			if (info.show_code) showEditor.setValue(info.show_code);
			compile();
		}
	// Initial code :
		button ({
			n_dim : 1,
			use_v_z : true,
			display_show_code : false,
			sim_code : ["k = 1.0;\nm = 10.*x/N;\nz = 0.8*sin(2.0*pi*x/N-time/N);"],
			show_code : "float w = N/R.x;\nfloat x = floor(coord.x*w);\nfloat a = R.y*(0.5+0.5*F(x+0.5).x);\nfloat b = R.y*(0.5+0.5*F(x+1.5).x);\nfloat l = line(coord,vec2(x/w,a),vec2((x+1.)/w,b))-F(x).z;\nfloat r = min(length(coord - vec2((x+0.)/w,a))-2.-F(x+0.).w,\n              length(coord - vec2((x+1.)/w,b))-2.-F(x+1.).w);\nPsi = vec4(1)*smoothstep(1.,0.,min(r,l));"
		});
	// Compile default code :
		compile();
	// Launch animation loop :
		animate();
	// Connect buttons to functions :
		document.getElementById("compile").onclick = compile;
		(document.getElementById("show_check").onchange = () => {
			if (document.getElementById("show_check").checked) 
					document.getElementById("show").style.display = "inline";
			else 	document.getElementById("show").style.display = "none";
		})();
		document.getElementById("new_button").onclick = () => {
			document.getElementById("new_program").style.display = "inline";
			document.getElementById("name").value = "New Program";
			document.getElementById("2D").checked = true;
			document.getElementById("psi").checked = true;
			document.getElementById("n_stages").value = 1;
		}
		document.getElementById("cancel").onclick = () => {
			document.getElementById("new_program").style.display = "none";
		}
		document.getElementById("create_new_program").onclick = () => {
			let name = document.getElementById("name").value,
				dim = 1; if (document.getElementById("2D").checked) dim = 2;
			let use_v_z = false, variables = 1;
			if (document.getElementById("v_z").checked) use_v_z = true;
			else {
				if (document.getElementById("psi1").checked) variables = 2;
				if (document.getElementById("psi2").checked) variables = 3;
			}
			let n_stages = Number(document.getElementById("n_stages").value);
			let sim_code = new Array (n_stages);
			for (let i = 0; i < n_stages; i++)  sim_code[i] = "";
			let newButton = document.createElement("BUTTON");
			newButton.id = name;
			newButton.innerHTML = name;
			document.getElementById("buttons").appendChild(newButton);
			(document.getElementById(name).onclick = () => {
				button({
					n_dim : dim,
					use_v_z : use_v_z,
					display_show_code : true,
					n_psi : variables,
					sim_code : sim_code,
					show_code : "Psi = F(coord);"
				});
			})();
			document.getElementById("new_program").style.display = "none";
		}
		//document.getElementById("show_check").click();
		document.getElementById("iters").value = '8';
	// Controls (get mouse input)
		function  getMousePos(canvas, evt) {
		  var rect = canvas.getBoundingClientRect(), // abs. size of element
		      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
		      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

		  return {
		    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
		    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
		  }
		}
		canvas.onmousedown = (e) =>  {
			var p = getMousePos (canvas, e);
		    mouse =  [p.x,canvas.height-p.y,p.x,canvas.height-p.y];
		}
		canvas.onmousemove = (e) => {
			var p = getMousePos (canvas, e);
		    if (mouse[3]>0)
		    mouse = [p.x,canvas.height-p.y,mouse[0],mouse[1]];
		}
		canvas.onmouseout = (e) => {
			mouse = [0,0,0,0];
			//
		}
		canvas.onmouseup = (e) => {
			mouse = [0,0,0,0];
			//
		}
		canvas.ontouchstart = function (a) {
	    	canvas.onmousedown(a.touches[0]);
	    }
	    canvas.ontouchend = function (a) {
	    	canvas.onmouseup(a.touches[0]);
	    }
	    canvas.ontouchmove = function (a) {
	    	canvas.onmousemove(a.touches[0]);
	    }
}