class Rover {
	constructor(x, y) {
		this.x = x; // these dimensions are in metres
		this.y = y;
		this.theta = 0; // theta

		this.speed = 0; // m/s
		this.vtheta = 0; // rad/s

		this.dt = 1/30;

		this.drive = this.drive.bind(this);
		this.pivot = this.pivot.bind(this);
		this.stop = this.stop.bind(this);
		this.getGps = this.getGps.bind(this);
		this.update = this.update.bind(this);
	}

	drive(speed) {
		this.vtheta = 0;
		this.speed = speed;
	}

	pivot(speed) {
		this.speed = 0;
		this.vtheta = speed;
	}

	stop() {
		this.speed = this.vtheta = 0;
	}

	getGps() {
		return {
			lat: 1 / 111000 * this.x - 79.4655, // gps coordinates centred on utias
			lon: 1 / 111000 * this.y + 43.7819,
			head: this.theta
		}
	}

	update() {
		this.x += Math.cos(this.theta) * this.speed * this.dt;
		this.y += Math.sin(this.theta) * this.speed * this.dt;
		this.theta += this.vtheta * this.dt;
	}
}

module.exports = Rover