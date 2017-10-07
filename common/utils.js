function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function toGPS (x, y, origin) {
	return {
		lat: 1 / 111000 * x + origin.lat,
		lon: 1 / 111000 * y + origin.lon
	}
}


utias = {lat: -79.4655, lon: 43.7819};

if (typeof(module) !== "undefined")
	module.exports = { toDegrees, toRadians, toGPS, utias } // for node
else
	utils = { toDegrees, toRadians, toGPS, utias }; // for browser