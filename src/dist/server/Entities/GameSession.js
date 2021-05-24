"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSession = void 0;
class GameSession {
    constructor(GameSessionId) {
        this.GameSessionId = GameSessionId;
        this.players = [];
        this.playerUniqIdCntr = 0;
        this.timeStarted = new Date();
        this.gameStarted = false;
        this.isPrivateGame = false;
    }
}
exports.GameSession = GameSession;
//# sourceMappingURL=GameSession.js.map