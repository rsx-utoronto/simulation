$ = document.querySelector.bind(document);
let noop = ()=>{};

var scaleFactor = 200;

var canvas = document.getElementById('cvs');
var ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);

var initGPS, _obstacles;
Promise.all(['/gps/', '/private/obstacles/'].map(_.unary(fetch)))
.then(responses =>
	Promise.all(responses.map(x => x.json())))
.then(([gps, _obstacles]) => {
	initGPS = gps; // first GPS so we have a reference to draw from
	obstacles = _obstacles;
})
.then(x => requestAnimationFrame(render));

function render() {
	fetch('/lidar/')
	.then(response => response.json())
	.then(response => {
		c = _.pickBy(response, (val, key) => val < 1e5)
		//if (!_.isEmpty(c))
			//console.log(c) // found an obstacle!
	})
    
    fetch('/private/ball')
    .then(response => response.json())
    .then(response => {
         let dx = (response.gps.latitude - initGPS.latitude) * 500000;
		 let dy = (response.gps.longitude - initGPS.longitude) * 500000;
         let radius = response.radius
         ctx.beginPath();
         ctx.arc(scaleFactor + dx, scaleFactor+ dy, radius, 0, 2 * Math.PI);
         ctx.stroke();
        ctx.fillStyle = 'yellow'
         ctx.fill();
    });

	fetch('/gps/')
	.then(response => response.json())
	.then(function(response) {
		let dx = (response.latitude - initGPS.latitude) * 500000;
		let dy = (response.longitude - initGPS.longitude) * 500000;

		// erase gradually
		ctx.fillStyle = 'rgba(255,255,255,0.03)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fill();
        

		// draw obstacles
		obstacles.forEach(obstacle => {
			ctx.beginPath();
			ctx.fillStyle = 'red'
			obstacle.forEach(vertex => {
				ctx.lineTo(scaleFactor + (vertex.latitude - initGPS.latitude) * 500000, scaleFactor + (vertex.longitude - initGPS.longitude) * 500000);
			});
			ctx.fill();
		});

		// draw the box
		ctx.fillStyle = 'green';
		ctx.fillRect(scaleFactor + dx, scaleFactor + dy, 10, 10);
		ctx.fillRect(scaleFactor + dx + 20 * Math.cos(utils.toRadians(response.heading)), scaleFactor + dy + 20 * Math.sin(utils.toRadians(response.heading)), 5, 5);
		window.requestAnimationFrame(render)
	});
}

$('#ebrake').addEventListener('click', () => fetch('/ebrake', {method:'PUT'}))
$('#stop').addEventListener('click', () => fetch('/drive/stop', {method:'PUT'}))
$('#backward').addEventListener('click', () => fetch('/drive/speed/-1', {method:'PUT'}))
$('#forward').addEventListener('click', () => fetch('/drive/speed/1', {method:'PUT'}))
$('#pivot-left').addEventListener('click', () => fetch('/drive/pivot/-20', {method:'PUT'}))
$('#pivot-right').addEventListener('click', () => fetch('/drive/pivot/20', {method:'PUT'}))
$('#turn-left').addEventListener('click', () => fetch('/drive/speed/1/2', {method:'PUT'}))
$('#turn-right').addEventListener('click', () => fetch('/drive/speed/2/1', {method:'PUT'}))
$('#tennis-ball').addEventListener('click', () => fetch('/drive/tennis-ball', {method:'GET'}))


