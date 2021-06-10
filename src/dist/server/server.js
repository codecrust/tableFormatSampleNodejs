"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createANewPlayer = exports.GameRoomsDict = exports.unirest = void 0;
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Player_1 = require("./Entities/Player");
const bodyParser = require("body-parser");
const apicalls_1 = require("./apicalls");
const TableGameRoom_1 = require("./Entities/TableGameRoom");
exports.unirest = require('unirest');
var cors = require('cors');
//if (process.env.LOCAL == "true")
require('dotenv').config();
var ip = require("ip");
const serverAddress = ip.address();
const app = express();
//initialize a simple http server
const fs = require('fs');
/* const server = https.createServer({
    cert: fs.readFileSync('sslcert/fullchain.pem'),
    key: fs.readFileSync('sslcert/privkey.pem'),
}, app);
*/
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
exports.GameRoomsDict = {};
let GameRoomIdCntr = 0;
let socketIdCntr = 0;
//console.log("After call log");
//callGetTableTypesAPI("11");
wss.on('connection', (ws) => {
    console.log('socket opened');
    const extWs = ws;
    extWs.isAlive = true;
    extWs.uniqueId = ++socketIdCntr;
    ws.on('pong', () => {
        extWs.isAlive = true;
    });
    ws.on('open', function open() {
        console.log('websocket open');
    });
    ws.on('close', function close() {
        console.log('websocket closed');
        playerLeftRemoveFromGame(extWs);
    });
    //connection is up, let's add a simple simple event
    ws.on('message', (msg) => {
        var _a, _b;
        let message;
        message = JSON.parse(msg);
        if (message.t == "connect") {
            console.log(message);
            apicalls_1.callJoinTableAPI(extWs, "12", "2", message.playerID, message.entryFee);
            //create a player object
            //getPlayerData from Database
        }
        else if (message.t == "pBet") {
            console.log(message);
            (_a = extWs.player.gRoom) === null || _a === void 0 ? void 0 : _a.getPlayerBet(message.plRoomId, message.plChoice);
            //create a player object
            //getPlayerData from Database
        }
        else if (message.t == "autoRefill") {
            console.log("AUOT REFILL MSg");
            (_b = extWs.player.gRoom) === null || _b === void 0 ? void 0 : _b.callAutoRefill(extWs.player.plRoomNetId);
            //create a player object
            //getPlayerData from Database
        }
    });
    ws.on('error', (err) => {
        console.log('websocket errored');
        playerLeftRemoveFromGame(extWs);
    });
});
function createANewPlayer(extWs, tableId, playerId, playerBal) {
    let newP = new Player_1.Player(extWs, tableId, playerId);
    extWs.player = newP;
    let gRoom = exports.GameRoomsDict[tableId];
    if (!gRoom) {
        exports.GameRoomsDict[tableId] = new TableGameRoom_1.TableGameRoom(tableId, "11", "2");
    }
    exports.GameRoomsDict[tableId].addPlayerToRoom(newP, playerBal);
    console.log("Player Added to game successfully");
}
exports.createANewPlayer = createANewPlayer;
function playerLeftRemoveFromGame(extWs) {
    var _a;
    if (extWs == null || extWs.player == null) {
        console.log('Player that left undefined');
        return;
    }
    console.log("Player Left Room ");
    (_a = extWs.player.gRoom) === null || _a === void 0 ? void 0 : _a.removePlayerFromRoom(extWs.player);
    // callPlayerLeftTableAPI(extWs.player.playerID, extWs.player.tableGameID)
}
let nextMiniGame = 0;
setInterval(() => {
    wss.clients.forEach((ws) => {
        const extWs = ws;
        ws.ping(null, undefined);
    });
}, 1000);
setInterval(() => {
    wss.clients.forEach((ws) => {
        const extWs = ws;
        if (!extWs.isAlive) {
            return ws.terminate();
        }
        else {
            extWs.isAlive = false;
        }
    });
}, 15000);
const config = {
    serverId: -1,
    socketCnt: wss.clients.size
};
//Rest API
let router = express.Router();
//route to handle user registration
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.get('/test', function (req, res, next) {
    // Handle the get for this route
    res.json("true");
});
app.use('/api', router);
//start our server
server.listen(80, () => {
    console.log(`Server started on port ${serverAddress} :)`);
});
//# sourceMappingURL=server.js.map