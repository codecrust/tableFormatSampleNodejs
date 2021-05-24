"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const p2 = require("p2");
const server_1 = require("./server");
const Zombie_1 = require("./Entities/Zombie");
const Chunk_1 = require("./Entities/Chunk");
exports.world = new p2.World({
    gravity: [0, 0]
});
exports.maxYchunks = 10;
exports.maxXchunks = 10;
//world.defaultContactMaterial.friction = 0.5;
exports.world.on("beginContact", function (evt) {
    var bodyA = evt.bodyA, bodyB = evt.bodyB;
    console.log(bodyA.id + " ------------ " + bodyB.id);
});
/*
// Create an infinite ground plane body
var groundBody = new p2.Body({
    mass: 0
    // Setting mass to 0 makes it static
});
var groundShape = new p2.Plane();
groundBody.addShape(groundShape);
world.addBody(groundBody);
*/
// To animate the bodies, we must step the world forward in time, using a fixed time step size.
// The World will run substeps and interpolate automatically for us, to get smooth animation.
var fixedTimeStep = 1 / 30; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock
var lastTime;
// Animation loop
function animate(time) {
    //requestAnimationFrame(animate);
    // Compute elapsed time since last render frame
    var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
    // Move bodies forward in time
    exports.world.step(fixedTimeStep, deltaTime, maxSubSteps);
    lastTime = time;
}
exports.animate = animate;
function setWorldEvents() {
    exports.world.on('postStep', function (event) {
        for (var key in server_1.PlayersUniqIdDict) {
            let pl = server_1.PlayersUniqIdDict[key];
            //console.log(pl.keyUpDown+","+ pl.keyLeftRyt);
            pl.physbody.velocity = [10 * pl.keyLeftRyt, 10 * pl.keyUpDown];
            //  element.physbody.force[0] -= 100 *  element.physbody.position[0];
        }
    });
}
exports.setWorldEvents = setWorldEvents;
function populateWorld() {
    createWorldBoundaries();
    for (let i = 0; i < exports.maxXchunks; i++) {
        server_1.GameMap[i] = [];
        for (let j = 0; j < exports.maxYchunks; j++) {
            console.log(i + "," + j);
            server_1.GameMap[i][j] = new Chunk_1.Chunk();
        }
    }
    for (let i = 0; i < exports.maxXchunks; i++) {
        for (let j = 0; j < exports.maxYchunks; j++) {
            for (let k = 0; k < 2; k++) {
                let x = (i * 30) + getRandomInt(29);
                let y = (j * 30) + getRandomInt(29);
                let zomBody = createAndAddNewPlayerBody(x, y);
                let aiZombie = new Zombie_1.Zombie(zomBody);
                server_1.AIUniqIdDict[zomBody.id] = aiZombie;
                server_1.GameMap[i][j].chunkEntities.push(aiZombie);
            }
        }
    }
}
exports.populateWorld = populateWorld;
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function createWorldBoundaries() {
    // Create bottom plane
    var plane = new p2.Body({
        position: [0, 0],
    });
    plane.addShape(new p2.Plane());
    exports.world.addBody(plane);
    // Left plane
    var planeLeft = new p2.Body({
        angle: -Math.PI / 2,
        position: [0, 0]
    });
    planeLeft.addShape(new p2.Plane());
    exports.world.addBody(planeLeft);
    // Right plane
    var planeRight = new p2.Body({
        angle: Math.PI / 2,
        position: [300, 0],
    });
    planeRight.addShape(new p2.Plane());
    exports.world.addBody(planeRight);
    // Right plane
    var planeTop = new p2.Body({
        angle: Math.PI,
        position: [0, 300]
    });
    planeTop.addShape(new p2.Plane());
    exports.world.addBody(planeTop);
}
function createAndAddNewPlayerBody(x, y) {
    let circleBody = new p2.Body({
        mass: 1,
        //angle:0,
        position: [x, y],
        angularDamping: 0
    });
    //let circleBody = new Body(){
    //  type: Body.KINEMATIC        
    // });
    circleBody.damping = 0.8;
    let circleShape = new p2.Circle({ radius: 1 });
    circleBody.addShape(circleShape);
    // ...and add the body to the world.
    // If we don't add it to the world, it won't be simulated.
    exports.world.addBody(circleBody);
    return circleBody;
}
exports.createAndAddNewPlayerBody = createAndAddNewPlayerBody;
function removeThisBodyFromPhysics(body) {
    exports.world.removeBody(body);
}
exports.removeThisBodyFromPhysics = removeThisBodyFromPhysics;
// Start the animation loop
//requestAnimationFrame(animate);
//# sourceMappingURL=PhysicsWorld.js.map