"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomData = exports.CMD = void 0;
var CMD;
(function (CMD) {
    CMD["PADD"] = "Padd";
    CMD["PLEFT"] = "Pleft";
    CMD["MSG"] = "Message";
    CMD["TIMEUP"] = "TimeUp";
    CMD["SNAP"] = "Snap";
    CMD["PROPUPDATE"] = "PropUpdate";
    CMD["GAMERESULT"] = "GameResult";
    CMD["REWARD"] = "Reward";
})(CMD = exports.CMD || (exports.CMD = {}));
class RoomData {
    constructor(gameID, maxPlayers, gameRoundTime = 0) {
        this.gameID = gameID;
        this.maxPlayers = maxPlayers;
        this.gameRoundTime = gameRoundTime;
        this.needRX = false;
        this.needRZ = false;
        this.needObjRX = false;
        this.needObjRZ = false;
    }
}
exports.RoomData = RoomData;
//# sourceMappingURL=Pojo.js.map