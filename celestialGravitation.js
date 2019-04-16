//Author: R. Nathan Lewis
//Date:   April 16, 2019

//Disclaimer: Radii of Planetary Objects are NOT TO SCALE. Each pixel is scaled to 1 Million Km. Planets would be thousands of times smaller than a pixel

var cnv;
var planets = [];

const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const year = day * 365.25;

var speed;
var speedTxt;

var G;

const scl = 1e9;

setSpeed(1);



//Speed
function setSpeed(S){
	speed = S;
	setSpeedText();

	var spd = speed / 60;
	G = 6.67e-11 * spd*spd;
}



//Classes
class Planet {
	constructor(pos,mass,r=5){
		//Mil Km
		this.pos = pos;
		this.v = createVector(0,0);
		this.a = createVector(0,0);
		this.mass = mass;
		this.r = r;
	}
	
	addTotalAcc() {
		var acc = createVector(0,0);
		for (var i=0; i<planets.length; i++){
			if (planets[i] != this){
				var angle = getVectorAngle(this.pos, planets[i].pos);
				var force = getForce(this.mass,planets[i].mass,distance(planets[i].pos,this.pos));
				var a = getAcceleration(force, this.mass);
				acc.add(angle.mult(a));
			}
		}
		this.a = acc;
	}
	
	update() {
		strokeWeight(this.r);
		stroke(255);
		
		this.addTotalAcc();
		this.v.add(this.a);
		this.pos.add(this.v);
		point(this.pos.x,this.pos.y);
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
	return a/scl;
}

function getVectorAngle(pos1,pos2){
	//Returns vector of Angle towards pos2 from pos1
	var vec = createVector(pos2.x-pos1.x,pos2.y-pos1.y).normalize();
	//Output in Meters
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
	var d = dist(pos1.x,pos1.y,pos2.x,pos2.y) * scl;

	//Returns distance in meters
	return d;
}


//Presets
function orbitalPre(num,r=150,m1=1.989e30,m2=5.972e24,dV=1){
    //Set Speed
    setSpeed(year/3);
    
	//Reset Planets
	planets = [];
	//Create Large Centeral Mass Object
	var center = createVector(width/2,height/2);
	var star = new Planet(center, m1, 10);
	
	//Create Smaller Bodies in Circle Around Central Mass
	for (var i=0; i<num; i++){
		var pos = p5.Vector.fromAngle(TWO_PI*i/num).mult(r).add(center);
		//Create Smaller Body
		var planet = new Planet(pos, m2, 3);
		//Get Required Orbital Velocity and Angle for Smaller Bodies
		var angle = Math.atan2(pos.y-star.pos.y,pos.x-star.pos.x) + PI/2;
		
		var M = m1 + m2;
		var d = distance(pos,star.pos);
		oV = getCirOrbitalVelovity(M,d)/scl;
		planet.v = p5.Vector.fromAngle(angle).mult(oV).mult(dV);
		planets.push(planet);
	}
	//Add Central Body to Planets Array
	planets.push(star);
}


function randomPre(num){

	//Reset Planets
	planets = [];
	
	//Set Large Body Attributes
	var center = createVector(width/2,height/2);
	var mass = random(1e29,1e33);
	var r = random(8,10);
	
	//Set Speed
	setSpeed(year/map(mass,1e29,1e33,1e2,1e3));
	
	//Create Large Body
	var star = new Planet(center,mass,r);
	
	for (var i=0; i<num; i++){
		var pos = p5.Vector.fromAngle(random(TWO_PI)).mult(random(75,width/2)).add(center);
		mass = random(1e3,1e24);
		var v = getCirOrbitalVelovity(star.mass,200*scl)/scl;
		r = random(3,5);
		var planet = new Planet(pos,mass,r);
		planet.v = p5.Vector.random2D().mult(v);
		
		planets.push(planet);
			
	}
	
	planets.push(star);
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

function setup(){
	frameRate(60);
	if (displayWidth > displayHeight) {
		cnv = createCanvas(500, 500, P2D);
	} else {
		cnv = createCanvas(displayWidth*0.95,displayWidth*0.95, P2D);
	}
	cnv.parent("cnv");
	
	//orbitalPre(100);
	randomPre(200);
	
	background(0);
}

function draw(){
	background(0);
	textSize(15);
	fill(255);
	strokeWeight(1);
	text(speedTxt,4,16);
	
	for (var i=0; i<planets.length; i++){
		planets[i].update();
	}
}