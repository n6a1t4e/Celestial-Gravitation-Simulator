//Author: R. Nathan Lewis
//Date:   April 16, 2019
//Version 1.1

var cnv;
var planets = [];

//Time Passed
var t = 0;

const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const year = day * 365.25;

//In Meters
const AU = 1.496e+11;
const earthRadius = 6.371e6;
const sunRadius = 695.51e6;

//In kg
const earthMass = 5.972e+24;
const sunMass = 1.989e+30;

var speed;
var speedTxt;
var sclSlider;

var interfaceButton;
var showInterface = 1;
var showTrails = 0;

var G;


//Speed
function setSpeed(S){
	speed = S;
	setSpeedText();

	var spd = speed / 60;
	G = 6.67e-11 * spd*spd;
}


//Interface
function Interface(){
	textSize(15);
	fill(255);
	stroke(0);
	strokeWeight(1);
	
	//time/sec
	text(speedTxt,4,16);
	
	//time
	text("Seconds: " + round(t*100)/100,4,32);
	
	
	textSize(12);
	stroke(0);
	strokeWeight(1);
	text((100 * scl / AU).toExponential(2) + " AU",width-105,height-8);
	
	stroke(255);
	line(width-105,height-5,width-5,height-5);
	
}



//Classes
class Planet {
	constructor(pos,mass,radius=5){
		this.pos = pos;
		this.v = createVector(0,0);
		this.a = createVector(0,0);
		this.mass = mass;
		//In Meters
		this.radius = radius;
		//g/cm^3
		this.density = (this.mass/1000) / this.getVolume();
		this.trail = [];
	}
	
	getVolume(){
		//cm^3
		return (4/3) * PI * Math.pow(this.radius * 100, 3);
	}
	
	addTotalAcc() {
		var acc = createVector(0,0);
		for (var i=0; i<planets.length; i++){
			if (planets[i] != this){
				//Get Distance Apart in M
				var separation = distance(planets[i].pos,this.pos);
				//Get Vector Angle Towards Planet
				var angle = getVectorAngle(this.pos, planets[i].pos);
				//Get Force of Gravity
				var force = getForce(this.mass,planets[i].mass,separation);
				//Calculate Acceleration
				var a = getAcceleration(force, this.mass);
				acc.add(angle.mult(a));
				//Roche Limit Calculation
				if (separation < this.rocheLimit(planets[i].density)){
					stroke(255,0,0);
				}
			}
		}
		this.a = acc;
	}
	
	rocheLimit(density) {
		//meters
		return this.radius * Math.pow(2*(this.density/density),1/3) /1000;
	}
	
	
	updatePlanet(){
		//Update Pos
		this.addTotalAcc();
		this.v.add(this.a);
		this.pos.add(this.v);
		

		//Draw Planet
		strokeWeight(this.radius/scl);
		stroke(255);
		var pos = this.pos.copy().div(scl).add(getCenter());
		point(pos.x,pos.y);
	}
	
	
	updateTrail(){
		//Update Trail
		var trailLength = 25;
this.trail.push(this.pos.copy().div(scl).add(getCenter()));
		if (this.trail.length > trailLength){
			this.trail.splice(0,1);
		}
		
		//Draw Trail
		strokeWeight(0.5);
		noFill();
		beginShape();
		for (var i=0; i<this.trail.length; i++){
			var pos = this.trail[i];
			vertex(pos.x,pos.y);
		}
		endShape();
	}
	
	
	update() {
	
		//Draw Planet
		this.updatePlanet();
	
		//Draw Trail
		if (showTrails !== 0){
			this.updateTrail();
		}
	}
}


//Gravitational Math
function getForce(m1,m2,r){
	//r in Meters
	var force = (G * m1 * m2) / (r * r);
	return force;
}

function getAcceleration(f,m){
	var a = f/m;
	return a;
}

function getVectorAngle(pos1,pos2){
	//Returns vector of Angle towards pos2 from pos1
	var vec = createVector(pos2.x-pos1.x,pos2.y-pos1.y).normalize();
	return vec;
}

function getCirOrbitalVelovity(M,r){
	//Input r in Meters
	var vel = Math.sqrt((G*M)/r);
	//Output in m/s
	return vel;
}

function getOrbitalPeriod(M,r){
	//Input in Meters
	var per = Math.sqrt((4 * PI * PI * r * r * r)/(G*M));

	//To Earth Years
	per = per/year;
	return per;
}

function distance(pos1,pos2){
	var d = dist(pos1.x,pos1.y,pos2.x,pos2.y);
	//Returns distance in meters
	return d;
}

function getCenter(){
	var center = createVector(width/2,height/2);
	return center;
}

function scaleVelocity(v){
	//v in m/s
	var velocity = v*speed/60;
	
	return velocity;
}





//Presets
function orbitalPre(num,r,m1=sunMass,m2=earthMass,dV=1){
	//Set Scale
	sclSlider.value((AU/6) / (width/2));
	scl = sclSlider.value();
	
	//Set Speed
	setSpeed(day*5);
	t = 0;
	
	//Reset Planets
	planets = [];
	//Create Large Centeral Mass Object
	var star = new Planet(createVector(0,0), m1, 691.51e6);
	
	//Create Smaller Bodies in Circle Around Central Mass
	for (var i=0; i<num; i++){
		var pos = p5.Vector.fromAngle(TWO_PI*i/num).mult(r);
		//Create Smaller Body
		var planet = new Planet(pos, m2, 6.371e6);
		//Get Required Orbital Velocity and Angle for Smaller Bodies
		var angle = Math.atan2(pos.y-star.pos.y,pos.x-star.pos.x) + PI/2;
		
		var M = m1 + m2;
		var d = distance(pos,star.pos);
		
		oV = getCirOrbitalVelovity(M,d);
		//console.log(oV);
		planet.v = p5.Vector.fromAngle(angle).mult(oV).mult(dV);
		planets.push(planet);
	}
	//Add Central Body to Planets Array
	planets.push(star);

}


function randomPre(num){
	//Set Scale
	sclSlider.value(AU/(width/10));
	scl = sclSlider.value();

    //Set Speed
	setSpeed(day*3);
	t = 0;
	
	//Reset Planets
	planets = [];

	
	//Set Large Body Attributes
	var center = getCenter();
	var mass = random(sunMass*1e-1,sunMass*1e3);
	var r = 691.51e6;
	
	//Create Large Body
	var star = new Planet(center.copy(),mass,r);
	planets.push(star);

    //Create Smaller Bodies
	for (var i=0; i<num; i++){
		var pos = p5.Vector.fromAngle(random(TWO_PI)).mult(random(AU/2,(AU*width/2)/100)).add(center);

		mass = random(earthMass*1e-21,2*earthMass);
		var v = getCirOrbitalVelovity(star.mass,200*scl);

		r = random(3e6,12e6);
		var planet = new Planet(pos,mass,r);
		planet.v = p5.Vector.random2D().mult(v);
		
		planets.push(planet);
			
	}
	
}


function earthMoonPre(){
	//Set Scale
	sclSlider.value(3e6);
	scl = sclSlider.value();
	
	//Set Speed
	setSpeed(day*3);
	t = 0;
	
	//Get Center
	var center = getCenter();
	
	//Reset Planets
	planets = [];
	
	//Set Earth
	var earth = new Planet(center.copy(),earthMass,earthRadius);
	
	var d = 356.355e6;
	//Set Moon
	var pos = center.copy().add(createVector(d,0));
	var moon = new Planet(pos,7.35e22,1.7371e6);
	
	
	moon.v = createVector(0,-scaleVelocity(1078.2));
	
	planets.push(earth);
	planets.push(moon);
}



//Text
function setSpeedText(){
	var end;
	var spd = speed;
	
	if (speed < minute){
		end = " Sec/Sec";
	}
	else if (speed < hour){
		end = " Min/Sec";
		spd /= minute;
	}
	else if (speed < day){
		end = " Hours/Sec";
		spd /= hour;
	}
	else if (speed < year){
		end = " Days/Sec";
		spd /= day;
	}
	else {
		end = " Years/Sec";
		spd /= year;
	}
	if (spd > 1){
		spd = Math.round(spd*100)/100;
	}
	
	speedTxt = spd + end;
}


function mouseWheel(event){
    var initVal = sclSlider.value()
    sclSlider.value(initVal+event.delta*1e5);
}


function setup(){
	frameRate(60);
	if (displayWidth > displayHeight) {
		cnv = createCanvas(500, 500, P2D);
	} else {
		cnv = createCanvas(displayWidth*0.95,displayWidth*0.95, P2D);
	}
	cnv.parent("cnv");
	
	
	//Sliders
	sclSlider = createSlider(1,AU/1e2);
	sclSlider.parent("sliders");
	
	
	//Buttons
	interfaceButton = createButton("Show Interface");
	interfaceButton.mousePressed(
		function(){
			showInterface = (showInterface+1)%2;
		}
	);
	interfaceButton.parent("buttons");
	
	trailsButton = createButton("Show Trails");
	trailsButton.mousePressed(
		function(){
			for(var i=0; i<planets.length; i++){
				planets[i].trail = [];
			}
			showTrails = (showTrails+1)%2;
		}
	);
	trailsButton.parent("buttons");
	
	randomSystemButton = createButton("Random System");
	randomSystemButton.mousePressed(function(){randomPre(100)});
	massiveOrbitButton = createButton("Massive Orbit System");
	massiveOrbitButton.mousePressed(function(){orbitalPre(100,AU/8)});
	earthMoonButton = createButton("Earth and Moon");
	earthMoonButton.mousePressed(earthMoonPre);
	
	randomSystemButton.parent("buttons");
	massiveOrbitButton.parent("buttons");
	earthMoonButton.parent("buttons");
	
	
	//Preset Setup
	randomPre(100);


	background(0);
}

function draw(){
	//noLoop();
	background(0);
	if (frameRate()>0){
		t+=(1/frameRate());
	}
	
	scl = sclSlider.value();
	
	for (var i=0; i<planets.length; i++){
		planets[i].update();
	}
	
	if (showInterface !== 0){
		Interface();
	}
	
	
}
