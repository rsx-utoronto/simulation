var express = require('express');
var _ = require('lodash');
var Rover = require('./rover');
var Obstacle = require('./obstacle');
var Ball = require('./ball');
var utils = require('../common/utils');
var cors = require('cors');
let app = express();
let rover = new Rover(10, 10);
let tennis_ball = new Ball({x: 50, y: 50}, 5);
let obstacles = [new Obstacle([
	{x: 10, y: 30},
	{x: 40, y: 50},
	{x: 20, y: 10}
])];

app.use(cors())

app.put('/drive/speed/:speed', (req, res) => {
	rover.drive(parseFloat(req.params.speed));
	res.sendStatus(200);
})

/* The interface is in degrees per second */
app.put('/drive/speed/:speed0/:speed1', (req, res) => {
    var leftWheelSpeed = parseFloat(req.params.speed0);
    var rightWheelSpeed = parseFloat(req.params.speed1);
    var forwardVelocity = 0.5 * (leftWheelSpeed + rightWheelSpeed);  
    var turningSpeed = 20*(leftWheelSpeed - rightWheelSpeed);
    rover.drive(forwardVelocity);
	rover.turn(utils.toRadians(turningSpeed));
    
	res.sendStatus(200);
})

app.put('/drive/pivot/:pivot', (req, res) => {
	rover.pivot(utils.toRadians(parseFloat(req.params.pivot)));
	res.sendStatus(200);
})

app.put('/drive/stop', (req, res) => {
	rover.stop();
	res.sendStatus(200);
})

app.put('/ebrake', (req, res) => {
    rover.set_ebrake();
	res.sendStatus(200);
})

app.get('/gps', (req, res) => {
	res.json(rover.getGps());
})

app.get('/lidar', (req, res) => {
	res.json(
		_.zipObject(_.range(-30, 30), _.range(-30, 30).map(angle => {
			return _.min(_.map(obstacles, obs => obs.getDistance(rover, utils.toRadians(angle) + rover.theta, 10)))
		}))
	);
})

app.get('/drive/tennis-ball', (req, res) => {
    var angle = tennis_ball.getAngle(rover, 1000);
    var distance = tennis_ball.getDistance(rover, 1000);
    console.log('Angle to tennis ball:', utils.toDegrees(angle));
    console.log(' ');
    res.json(angle);
})

/* ONLY USE FOR DRAWING */
app.get('/private/obstacles', (req, res) => {
	res.json(obstacles.map(
		obstacle => obstacle.vertices.map(({x, y}) => utils.toGPS(x, y, utils.utias))
	))
})

app.get('/private/ball', (req, res) => {
    //The coordinates of the ball need to be returned and not the x,y value of the ball
    var gpsBall = {gps: utils.toGPS(tennis_ball.center.x, tennis_ball.center.y, utils.utias), radius: tennis_ball.radius}
	res.json(gpsBall);
})

// serve static files
app.use(express.static('.'));

app.listen(8080, () => {
	console.log('App is listening on port 8080')
})

setInterval(rover.update, 1 / rover.dt);