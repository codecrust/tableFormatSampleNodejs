"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableGameRoom = void 0;
class TableGameRoom {
    constructor(roomId, gameId, tableTypeId) {
        this.roomId = roomId;
        this.gameId = gameId;
        this.tableTypeId = tableTypeId;
        this.minPlayers = 0;
        this.maxPlayers = 0;
        this.PlayersUniqIdDict = {};
    }
    addPlayerToRoom(pl) {
        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] == null) {
                this.PlayersUniqIdDict[i] = pl;
                pl.plRoomNetId = i;
                break;
            }
        let playerAddedMsg = {
            t: "PADD",
            plRoomId: pl.plRoomNetId
        };
        this.sendMessageToOthers(playerAddedMsg, pl.plRoomNetId);
    }
    sendMessageToOthers(content, plRoomNetId) {
        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] != null && i != plRoomNetId && this.PlayersUniqIdDict[i]) {
                this.PlayersUniqIdDict[i].sendMessage(content);
            }
    }
    getRoomSnap(plRoomNetId) {
        let currPlsData = [];
        for (let i = 0; i < this.maxPlayers; i++) {
            let player = this.PlayersUniqIdDict[i];
            if (player == null || player.plRoomNetId == plRoomNetId)
                continue;
            currPlsData.push({
                plRoomId: player.plRoomNetId
            });
        }
    }
}
exports.TableGameRoom = TableGameRoom;
//# sourceMappingURL=GameRoom.js.map