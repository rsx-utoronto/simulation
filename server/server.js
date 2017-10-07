var express = require('express');
var _ = require('lodash');
var Rover = require('./rover');
var Obstacle = require('./obstacle');
var utils = require('../common/utils');
var cors = require('cors');

let app = express();
let rover = new Rover(10, 10);
let obstacles = [new Obstacle([
	{x: 10, y: 30},
	{x: 40, y: 50},
	{x: 20, y: 10}
])];

app.use(cors())

app.put('/drive/speed/:speed', (req, res) => {
	rover.drive(parseFloat(req.params.speed));
    console.log(req.speed);
	res.sendStatus(200);
})

/* The interface is in degrees per second */
app.put('/drive/speed/:speed0/:speed1', (req, res) => {
    var turningSpeed = parseFloat(req.params.speed0) - parseFloat(req.params.speed1);
	rover.turn(utils.toRadians(parseFloat(turningSpeed)));
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

/* ONLY USE FOR DRAWING */
app.get('/private/obstacles', (req, res) => {
	res.json(obstacles.map(
		obstacle => obstacle.vertices.map(({x, y}) => utils.toGPS(x, y, utils.utias))
	))
})

app.listen(8080, () => {
	console.log('App is listening on port 8080')
})

setInterval(rover.update, 1 / rover.dt);