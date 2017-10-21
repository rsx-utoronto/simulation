var _ = require('lodash');
var utils = require('../common/utils');


class Ball {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
        this.getAngle = this.getAngle.bind(this);
        this.getDistance = this.getDistance.bind(this);
    }

    //Returns the distance to the ball in meters by getting the GPS coordinates, then using a distance calculation formula
    getDistance(robot, sensorRange){
        var robotGPS = utils.toGPS(robot.x, robot.y, utils.utias);
        var ballGPS = utils.toGPS(this.center.x, this.center.y, utils.utias);

        var distance = utils.getDistanceGPS(robotGPS, ballGPS);
        
        if(distance > sensorRange) distance = -1;

        return distance
    }

    // Function returns the angle. A negative angle means the ball is to the left of the rover
    getAngle(robot, sensorRange) {
        var deltaX = this.center.x - robot.x;
        var deltaY = this.center.y - robot.y;
        var angle = Math.atan2(deltaY, deltaX);

        //Convert rover angle so that this function returns minimum angle between rover and tennis ball
        //e.g. rather than returning 3pi/2 rad, the function will return -pi/2 rad
        var roverAngle = robot.theta;
        if(roverAngle  > Math.PI) roverAngle = roverAngle - (2*Math.PI);
        if(roverAngle < -Math.PI) roverAngle = roverAngle + (2*Math.PI);

        angle = angle - roverAngle;
        
        if(angle  > Math.PI) angle = angle - (2*Math.PI);
        if(angle < -Math.PI) angle = angle + (2*Math.PI);
        
        if(this.getDistance(robot, sensorRange) == -1) angle = -1;
        
        return angle;
    }

}

module.exports = Ball;
