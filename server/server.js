var express = require('express');
let Rover = require('./rover');
let cors = require('cors');

let app = express();
let rover = new Rover(10, 10)

app.use(cors())

app.put('/drive/speed/:speed', (req, res) => {
	rover.drive(parseFloat(req.params.speed));
	res.sendStatus(200);
})

app.put('/drive/pivot/:pivot', (req, res) => {
	rover.pivot(parseFloat(req.params.pivot));
	res.sendStatus(200);
})

app.put('/drive/stop', (req, res) => {
	rover.stop();
	res.sendStatus(200);
})

app.get('/gps', (req, res) => {
	res.json(rover.getGps());
})

app.listen(8080, () => {
	console.log('App is listening on port 8080')
})

setInterval(rover.update, 1 / rover.dt);