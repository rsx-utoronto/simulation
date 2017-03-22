$ = document.querySelector.bind(document);
let noop = ()=>{};

var canvas = document.getElementById('cvs');
var ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);

var initGPS;
fetch('http://localhost:8080/gps').then(response => response.json()).then(response => {
	initGPS = response;
});

function render() {
	fetch('http://localhost:8080/gps')
	.then(response => response.json())
	.then(function(response) {
		let dx = (response.lat - initGPS.lat) * 100000;
		let dy = (response.lon - initGPS.lon) * 100000;

		// fill gradually
		ctx.fillStyle = 'rgba(255,255,255,0.03)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fill();

		// draw the box
		ctx.fillStyle = 'green';
		ctx.fillRect(50 + dx, 50 + dy, 10, 10);
		ctx.fillRect(50 + dx + 20 * Math.cos(response.head), 50 + dy + 20 * Math.sin(response.head), 5, 5);
		window.requestAnimationFrame(render)
	});
}

$('#stop').addEventListener('click', () => fetch('http://localhost:8080/drive/stop', {method:'PUT'}))
$('#backward').addEventListener('click', () => fetch('http://localhost:8080/drive/speed/-10', {method:'PUT'}))
$('#forward').addEventListener('click', () => fetch('http://localhost:8080/drive/speed/10', {method:'PUT'}))
$('#pivot-left').addEventListener('click', () => fetch('http://localhost:8080/drive/pivot/-0.8', {method:'PUT'}))
$('#pivot-right').addEventListener('click', () => fetch('http://localhost:8080/drive/pivot/0.8', {method:'PUT'}))


requestAnimationFrame(render);