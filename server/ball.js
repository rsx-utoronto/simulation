var _ = require('lodash');
var utils = require('../common/utils');

class Ball {
	constructor(center, radius) {
		this.center = center;
        this.radius = radius;
		this.getAngle = this.getAngle.bind(this);
	}
    
	// Function returns the angle negative means the ball is to the left of the rover
	getAngle(robot, sensorRange) {
        var deltaX = this.center.x - robot.x;
        var deltaY = this.center.y - robot.y;
        var angle = Math.atan2(deltaY, deltaX);
        
        //Convert rover angle so that this function returns minimum angle between rover and tennis ball 
        //e.g. rather than returning 3pi/2 rad, the function will return -pi/2 degrees 
        var roverAngle = robot.theta;
        if(roverAngle  > Math.PI) roverAngle = roverAngle - (2*Math.PI);
        if(roverAngle < -Math.PI) roverAngle = roverAngle + (2*Math.PI);
        
        angle = angle - roverAngle;
        return angle;
	}
}

module.exports = Ball;
