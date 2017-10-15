var _ = require('lodash');
var utils = require('../common/utils');
var EARTH_RADIUS_IN_METERS = 6372797.560856;

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

        var y1 = utils.toRadians(robotGPS.latitude);
        var y2 = utils.toRadians(ballGPS.latitude);
        var latavg = utils.toRadians((robotGPS.latitude + ballGPS.latitude) / 2)

        var x1 = utils.toRadians(robotGPS.longitude * Math.cos(latavg));
        var x2 = utils.toRadians(ballGPS.longitude * Math.cos(latavg));

        var distance = EARTH_RADIUS_IN_METERS * Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));

        console.log('Ball:' , this.center.x, ',', this.center.y);
        console.log('Robot:', robot.x, ',', robot.y);

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
        return angle;
    }

}

module.exports = Ball;
