var _ = require('lodash');

class Obstacle {

	constructor(vertices) {
		this.vertices = vertices;  // should be stored in metres relative to the origin
		this.getDistance = this.getDistance.bind(this);
	}

	// Returns the distance along the ray to its intersection with line, and Infinity otherwise
	// sensorRange is the maximum sensitive range of the lidar
	// angle is in degrees
	getDistance(robot, angle, sensorRange) {
		return _.min(_.map(this.vertices.slice(0, -1), (v, i) =>
			getLineIntersection(robot.x, robot.y,
				robot.x + Math.cos(angle) * sensorRange, robot.y + Math.sin(angle) * sensorRange,
				this.vertices[i].x, this.vertices[i].y,
				this.vertices[i+1].x, this.vertices[i+1].y
			)
		))
	}
}

// Modified version of http://stackoverflow.com/a/1968345/3080953 (detecting intersections between line segments)
// handle case when det is zero
// returns the distance to the intersection from p0_x, p0_y, i.e. the first point
// returns a large number instead of Infinity because json doesn't handle Infinity.
function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
	let s1_x = p1_x - p0_x; s1_y = p1_y - p0_y; s2_x = p3_x - p2_x; s2_y = p3_y - p2_y;
	let det = (-s2_x * s1_y + s1_x * s2_y);
	if (det === 0) return false;  // colinear
	let s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / det;
	let t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / det;

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return Math.sqrt(t * (s1_x * s1_x + s1_y * s1_y));
    }
    return 1e6;
}

module.exports = Obstacle;