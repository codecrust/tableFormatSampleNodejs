"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(plSocket, tableGameID, playerID) {
        this.plSocket = plSocket;
        this.tableGameID = tableGameID;
        this.playerID = playerID;
        this.plRoomNetId = -1;
        this.gRoom = null;
        this.choice = null;
        this.balance = -1;
    }
    //id of game session player is inside
    sendMessage(content, isBinary = false) {
        if (this.plSocket) {
            if (isBinary)
                this.plSocket.send(content);
            else {
                this.plSocket.send(JSON.stringify(content));
            }
        }
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map