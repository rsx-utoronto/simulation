var EARTH_RADIUS_IN_METERS = 6372797.560856;

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function toGPS (x, y, origin) {
    return {
        latitude: 1 / 111000 * x + origin.latitude,
        longitude: 1 / 111000 * y + origin.longitude
    }
}

function getDistanceGPS(point1, point2){
    var y1 = toRadians(point1.latitude);
    var y2 = toRadians(point2.latitude);
    var latavg = toRadians((point1.latitude + point2.latitude) / 2)

    var x1 = toRadians(point1.longitude * Math.cos(latavg));
    var x2 = toRadians(point2.longitude * Math.cos(latavg));

    var distance = EARTH_RADIUS_IN_METERS * Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
    
    return distance
}

utias = {latitude: -79.4655, longitude: 43.7819};

if (typeof(module) !== "undefined")
    module.exports = { toDegrees, toRadians, toGPS, utias, getDistanceGPS } // for node
else
    utils = { toDegrees, toRadians, toGPS, utias, getDistanceGPS }; // for browser