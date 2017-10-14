var utils = require('../common/utils');
var _ = require('lodash')


class Rover {
	constructor(x, y) {
		this.x = x; // these dimensions are in metres
		this.y = y;
		this.theta = 0; // stored in radians

		this.speed = 0; // m/s
		this.vtheta = 0; // rad/s

		this.dt = 1/30;
        
        this.ebrake = false;

		this.drive = this.drive.bind(this);
		this.pivot = this.pivot.bind(this);
        this.turn = this.turn.bind(this);
		this.stop = this.stop.bind(this);
		this.getGps = this.getGps.bind(this);
		this.update = this.update.bind(this);
	}

	drive(speed) {
        if(!this.ebrake){
            this.vtheta = 0;
            this.speed = speed;
        }
	}

	pivot(speed) {
        if(!this.ebrake){
		     this.speed = 0;
		     this.vtheta = speed;
        }
	}
    
    turn(turningSpeed) {
        if(!this.ebrake)this.vtheta = turningSpeed;
    }

	stop() {
		if(!this.ebrake)this.speed = this.vtheta = 0;
	}
    
    set_ebrake(){
        this.stop();
        if(this.ebrake == false)this.ebrake = true;
        else this.ebrake = false;
    }

	getGps() {
		return _.assignIn(
			utils.toGPS(this.x, this.y, utils.utias),
			{heading: utils.toDegrees(this.theta)} // heading is in degrees
		)
	}

	update() {
		this.x += Math.cos(this.theta) * this.speed * this.dt;
		this.y += Math.sin(this.theta) * this.speed * this.dt;
		this.theta += this.vtheta * this.dt;
        //Making sure angle isn't greater or less than 2pi, otherwise it messes up angle calculations later
        if(this.theta > 2 * Math.PI) this.theta = this.theta - 2*Math.PI;
        if(this.theta < -(2*Math.PI)) this.theta = this.theta + 2*Math.PI;
	}
}

module.exports = Rover