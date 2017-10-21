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
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
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
        ctx.fillStyle = 'black';
        ctx.fillRect(scaleFactor + dx, scaleFactor + dy, 10, 10);
        
        // Drawing an arrow and rotating it based on the direction
        var startingX = scaleFactor + dx + 20 * Math.cos(utils.toRadians(response.heading));
        var startingY = scaleFactor + dy + 20 * Math.sin(utils.toRadians(response.heading));
        var triangleWidth = 10;
        var rotationStartingAngle = utils.toRadians(270);
        
        // first save the untranslated/unrotated context
        ctx.save();

        ctx.beginPath();
        // move the rotation point to the center of the rect
        ctx.translate( startingX+triangleWidth/2, startingY+triangleWidth/2 );
        // rotate the rect
        ctx.rotate(utils.toRadians(response.heading)+ rotationStartingAngle);

        // draw the rect on the transformed context
        // Note: after transforming [0,0] is visually [x,y]
        //       so the rect needs to be offset accordingly when drawn
        translatedStartingPoint = -triangleWidth/2;
        
        //Drawing the actual arrow shape
        ctx.beginPath();
        ctx.moveTo(translatedStartingPoint, translatedStartingPoint);
        ctx.lineTo(translatedStartingPoint + 2*triangleWidth/5, translatedStartingPoint);
        ctx.lineTo(translatedStartingPoint + 2*triangleWidth/5, translatedStartingPoint - triangleWidth/2);
        ctx.lineTo(translatedStartingPoint + 3*triangleWidth/5, translatedStartingPoint - triangleWidth/2);
        ctx.lineTo(translatedStartingPoint + 3*triangleWidth/5, translatedStartingPoint);
        ctx.lineTo(translatedStartingPoint + triangleWidth, translatedStartingPoint);
        ctx.lineTo(translatedStartingPoint + triangleWidth, translatedStartingPoint);
        ctx.lineTo(translatedStartingPoint + triangleWidth/2, translatedStartingPoint + triangleWidth);
        ctx.fillStyle = "green";
        ctx.fill();

        // restore the context to its untranslated/unrotated state
        ctx.restore();

        window.requestAnimationFrame(render)
    });
}

$('#ebrake').addEventListener('click', () => fetch('/ebrake', {method:'PUT'}))
$('#stop').addEventListener('click', () => fetch('/drive/stop', {method:'PUT'}))
$('#backward').addEventListener('click', () => fetch('/drive/speed/-60', {method:'PUT'}))
$('#forward').addEventListener('click', () => fetch('/drive/speed/60', {method:'PUT'}))
$('#pivot-left').addEventListener('click', () => fetch('/drive/pivot/-20', {method:'PUT'}))
$('#pivot-right').addEventListener('click', () => fetch('/drive/pivot/20', {method:'PUT'}))
$('#turn-left').addEventListener('click', () => fetch('/drive/speed/30/60', {method:'PUT'}))
$('#turn-right').addEventListener('click', () => fetch('/drive/speed/60/30', {method:'PUT'}))
$('#tennis-ball').addEventListener('click', () => fetch('/drive/tennis-ball', {method:'GET'}))


