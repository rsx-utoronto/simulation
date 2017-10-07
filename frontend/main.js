$ = document.querySelector.bind(document);
let noop = ()=>{};

var canvas = document.getElementById('cvs');
var ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);

var initGPS, _obstacles;
Promise.all(['/gps', '/private/obstacles'].map(_.unary(fetch)))
.then(responses =>
	Promise.all(responses.map(x => x.json())))
.then(([gps, _obstacles]) => {
	initGPS = gps; // first GPS so we have a reference to draw from
	obstacles = _obstacles;
})
.then(x => requestAnimationFrame(render));

function render() {
	fetch('/lidar')
	.then(response => response.json())
	.then(response => {
		c = _.pickBy(response, (val, key) => val < 1e5)
		if (!_.isEmpty(c))
			console.log(c) // found an obstacle!
	})

	fetch('/gps')
	.then(response => response.json())
	.then(function(response) {
		let dx = (response.lat - initGPS.lat) * 500000;
		let dy = (response.lon - initGPS.lon) * 500000;

		// erase gradually
		ctx.fillStyle = 'rgba(255,255,255,0.03)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fill();

		// draw obstacles
		obstacles.forEach(obstacle => {
			ctx.beginPath();
			ctx.fillStyle = 'red'
			obstacle.forEach(vertex => {
				ctx.lineTo(200 + (vertex.lat - initGPS.lat) * 500000, 200 + (vertex.lon - initGPS.lon) * 500000);
			});
			ctx.fill();
		});

		// draw the box
		ctx.fillStyle = 'green';
		ctx.fillRect(200 + dx, 200 + dy, 10, 10);
		ctx.fillRect(200 + dx + 20 * Math.cos(utils.toRadians(response.head)), 200 + dy + 20 * Math.sin(utils.toRadians(response.head)), 5, 5);
		window.requestAnimationFrame(render)
	});
}

$('#stop').addEventListener('click', () => fetch('/drive/stop', {method:'PUT'}))
$('#backward').addEventListener('click', () => fetch('/drive/speed/-1', {method:'PUT'}))
$('#forward').addEventListener('click', () => fetch('/drive/speed/1', {method:'PUT'}))
$('#pivot-left').addEventListener('click', () => fetch('/drive/pivot/-20', {method:'PUT'}))
$('#pivot-right').addEventListener('click', () => fetch('/drive/pivot/20', {method:'PUT'}))


