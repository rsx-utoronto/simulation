var _ = require('lodash');

class Ball {
	constructor(center, radius) {
		this.center = center;
        this.radius = radius;
		this.getDistance = this.getDistance.bind(this);
	}
    
	// Function will eventually return angle
	getDistance(robot, sensorRange) {
        var angle = 10;
        return angle;
	}
}

module.exports = Ball;
