import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { Player } from './Entities/Player';
import e = require('express');
import * as https from "https";
import bodyParser = require('body-parser');
import { couldStartTrivia } from 'typescript';
import { group } from 'console';
import { callAutoRefillAPI, callGetPlayerBalanceAPI, callGetTableTypesAPI, callJoinTableAPI, callPlayerAddedToTableAPI, callPlayerLeftTableAPI, callTableGameStartingAPI } from './apicalls';
import { TableGameRoom } from './Entities/TableGameRoom';
export var unirest = require('unirest');
var cors = require('cors')


//if (process.env.LOCAL == "true")
require('dotenv').config()

var ip = require("ip");
const serverAddress = ip.address()

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



export interface ExtWebSocket extends WebSocket {
    gRoom: TableGameRoom;
    isAlive: boolean;
    uniqueId: number;
    player: Player;
}
export var GameRoomsDict: { [id: string]: TableGameRoom; } = {};

let GameRoomIdCntr: number = 0;
let socketIdCntr: number = 0;
//console.log("After call log");
//callGetTableTypesAPI("11");
wss.on('connection', (ws: WebSocket) => {
    console.log('socket opened');

    const extWs = ws as ExtWebSocket;
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
    ws.on('message', (msg: string) => {//| Buffer) => {

        let message;
        message = JSON.parse(msg);
        if (message.t == "connect") {

            console.log(message)

            callJoinTableAPI(extWs, "12", "2", message.playerID, message.entryFee);
            //create a player object
            //getPlayerData from Database

        }
        else if (message.t == "pBet") {

            console.log(message)
            extWs.player.gRoom?.getPlayerBet(message.plRoomId, message.plChoice)

            //create a player object
            //getPlayerData from Database

        }
        else if (message.t == "autoRefill") {

            console.log("AUOT REFILL MSg")
            extWs.player.gRoom?.callAutoRefill(extWs.player.plRoomNetId)


            //create a player object
            //getPlayerData from Database

        }

    });

    ws.on('error', (err) => {
        console.log('websocket errored');
        playerLeftRemoveFromGame(extWs);
    })
});

export function createANewPlayer(extWs: ExtWebSocket, tableId: string, playerId: string, playerBal: number) {
    let newP: Player = new Player(extWs, tableId, playerId);
    extWs.player = newP;

    let gRoom: TableGameRoom = GameRoomsDict[tableId]
    if (!gRoom) {
        GameRoomsDict[tableId] = new TableGameRoom(tableId, "11", "2")
    }
    GameRoomsDict[tableId].addPlayerToRoom(newP, playerBal);

    console.log("Player Added to game successfully")

}

function playerLeftRemoveFromGame(extWs: ExtWebSocket) {
    if (extWs == null || extWs.player == null) {
        console.log('Player that left undefined');
        return;
    }
    console.log("Player Left Room ");
    extWs.player.gRoom?.removePlayerFromRoom(extWs.player);
    // callPlayerLeftTableAPI(extWs.player.playerID, extWs.player.tableGameID)
}



let nextMiniGame: number = 0;
setInterval(() => {

    wss.clients.forEach((ws: WebSocket) => {
        const extWs = ws as ExtWebSocket;
        ws.ping(null, undefined);
    });


}, 1000);


setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
        const extWs = ws as ExtWebSocket;
        if (!extWs.isAlive) {
            return ws.terminate();
        } else {
            extWs.isAlive = false;
        }
    });
}, 15000);

const config = {

    serverId: -1,
    socketCnt: wss.clients.size
}




//Rest API

let router = express.Router();
//route to handle user registration
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

app.get('/test', function (req, res, next) {
    // Handle the get for this route

    res.json("true");

});


app.use('/api', router);


//start our server
server.listen(80, () => {
    console.log(`Server started on port ${serverAddress} :)`);
});




