What You See  :

	Canvas : The Canvas displays the simulation.
	Compile : Button to compile and start your simulation.
	Iterations : Number input to change the speed of the simulation
	Resolution (R) : Input to change canvas size. 'R' is used the sim code. 
	N : Input for number of balls (typically for 2D simulation) useable in code. (N can't be larger than R.x, the width of the screen)
	x, z, horizontal and vertical position (also coord.xy - sorry for the confusion - I should chan)
	Constant (dt) : change the value of an input parameter. 'dt' can be used in code.
	time : Simulation timer. 'time' can be used in code. 
	coord : coordinate on the screen
    Psi : state of each pixel (4 values/pixel * R.x*R.y pixels)
    A,B,C... Each stage of the simulation program, just one box if one stage.
 	Show : Program to display the simulation to the canvas. 

	Examples : Simulation Examples. Click to explore. 

What You Do :
        Lookup the simulation state with F(coord) or draw a procedural image using coord.
        Evolve the simulation with code in the simulation stages and display it with code in Show.
        Set the value of Psi = vec4(red, green, blue, alpha);
        Access the values of Psi with Psi.xy, Psi.xyzw, Psi.x... 

Available functions and inputs : 

	
	Data Types : 
		float, vec2, vec2, vec4, mat2, mat3, mat4

	Important Variables :
		Psi = vec4( input and output variable of the simulation );
		dx, dy, ddxx, ddyy = derivatives of Psi

	Input Variables : 
		R = vec2( canvas width ,  canvas height ) 
		time = float( time since init )
		I = int( frames since init )
		k = float( input variable )
		pi = float ( 3.14159 )

	Simulation Lookup Functions :
		F ( vec2(coord) )
		F ( float (x)   )   

	Built-in Functions :
		sin, cos, atan..., mod, fract, mix, normalize,
                min, max, clamp, step, smoothstep
		float rand(float), vec2 rand(vec2)
		line(vec2 coord, vec2 a, vec2 b), line (vec3 coord, vec3 a, vec3 b)
		ei(theta) = 2x2 rotation matrix 

Buttons :
    Create new buttons by creating new programs and passing the parameters to the 'button' function