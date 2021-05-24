"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableGameRoom = void 0;
const apicalls_1 = require("../apicalls");
const Utils_1 = require("./Utils");
class TableGameRoom {
    constructor(tableGameId, gameId, tableTypeId) {
        this.tableGameId = tableGameId;
        this.gameId = gameId;
        this.tableTypeId = tableTypeId;
        this.minPlayers = 1;
        this.maxPlayers = 4;
        this.PlayersUniqIdDict = {};
        this.currentPlayersCount = 0;
        this.countDown = 15;
        this.gamePlayTimer = 15;
        this.gameStarted = false;
        this.countdownStarted = false;
        this.choosenNum = null;
        this.totalPotAmount = 0;
    }
    addPlayerToRoom(pl, playerBal) {
        if (this.currentPlayersCount == this.maxPlayers || this.gameStarted) {
            this.currentPlayersCount++;
            this.removePlayerFromRoom(pl);
            return;
        }
        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] == null) {
                this.PlayersUniqIdDict[i] = pl;
                pl.plRoomNetId = i;
                break;
            }
        pl.gRoom = this;
        pl.balance = playerBal;
        let playerAddedMsg = {
            t: "pAdd",
            data: pl.plRoomNetId,
            bal: pl.balance
        };
        pl.sendMessage({ t: "joined", data: pl.plRoomNetId, bal: pl.balance, snap: this.getRoomSnap(pl.plRoomNetId) });
        console.log(this.getRoomSnap(pl.plRoomNetId));
        this.sendMessageToOthers(playerAddedMsg, pl.plRoomNetId);
        this.currentPlayersCount++;
        this.restartGame();
    }
    removePlayerFromRoom(pl) {
        delete this.PlayersUniqIdDict[pl.plRoomNetId];
        this.sendMessageToAll({ t: "pLeft", data: pl.plRoomNetId });
        this.currentPlayersCount--;
        apicalls_1.callPlayerLeftTableAPI(pl.playerID, pl.tableGameID);
        //  if (this.currentPlayersCount == 0) {
        //      callTableGameEndingAPI(this.gameId, this.tableGameId)
        // }
    }
    sendMessageToOthers(content, plRoomNetId) {
        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] != null && i != plRoomNetId && this.PlayersUniqIdDict[i]) {
                this.PlayersUniqIdDict[i].sendMessage(content);
            }
    }
    sendMessageToAll(content) {
        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] != null)
                this.PlayersUniqIdDict[i].sendMessage(content);
    }
    getRoomSnap(plRoomNetId) {
        let currPlsData = [];
        for (let i = 0; i < this.maxPlayers; i++) {
            let player = this.PlayersUniqIdDict[i];
            if (player == null || player.plRoomNetId == plRoomNetId)
                continue;
            currPlsData.push({
                id: player.plRoomNetId,
                bal: player.balance
            });
        }
        return currPlsData;
    }
    decreaseCountDownTimer() {
        //send update to everyone about lobby timer
        this.countDown--;
        console.log("decreaseCountDown " + this.countDown);
        this.sendMessageToAll({ t: "timer", data: this.countDown });
        //Reset timer
        if (this.countDown == 0) {
            apicalls_1.callTableGameStartingAPI(this.gameId, this.tableGameId);
            this.startGame();
        }
        else {
            this.countDownTimeOut = setTimeout(this.decreaseCountDownTimer.bind(this), 1000);
        }
    }
    startGame() {
        this.gameStarted = true;
        this.countdownStarted = false;
        this.gamePlayTimeout = setTimeout(this.gamePlayLoop.bind(this), 1000);
    }
    getPlayerBet(plRoomId, plChoice) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gamePlayTimer < 5 || this.gamePlayTimer < 0) {
                console.log("Bets closed");
                return;
            }
            let pl = this.PlayersUniqIdDict[plRoomId];
            if (pl.choice != null) {
                console.log("Player choice already recorded");
                return;
            }
            let choice = plChoice;
            console.log("before calling call coin wallet pl:" + pl.playerID);
            let result = yield apicalls_1.callUpdateCoinWalletAPI(pl.playerID, this.tableGameId, "-2", "PLAYER_BET", false, "Player Bet for guess number choice: " + choice);
            if (result) {
                this.totalPotAmount += 2;
                console.log("after coin wallet update pl:" + pl.playerID);
                pl.choice = choice;
                pl.balance = result.coinBalance;
                this.sendMessageToAll({ t: "pBal", id: pl.plRoomNetId, bal: pl.balance });
                this.sendMessageToAll({ t: "pChoice", id: pl.plRoomNetId, choice: Utils_1.CHOICE[pl.choice] });
                console.log("Player Choice = " + Utils_1.CHOICE[pl.choice]);
            }
            else {
                console.log("ERROR FAILED TO REGISTER PLAYER BET");
            }
        });
    }
    gamePlayLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gamePlayTimer == 0) {
                //choose a number
                this.choosenNum = 5; // 1+ Math.round(Math.random() * 6) + 1+ Math.round(Math.random() * 6)
                let winnerCount = 0;
                let winners = [];
                for (let i = 0; i < this.maxPlayers; i++) {
                    let player = this.PlayersUniqIdDict[i];
                    if (player == null || player.choice == null)
                        continue;
                    if (player.choice == Utils_1.CHOICE.LESSTHAN7 && this.choosenNum < 7) {
                        winnerCount++;
                        winners.push(player);
                    }
                    else if (player.choice == Utils_1.CHOICE.EQUAL7 && this.choosenNum == 7) {
                        winnerCount++;
                        winners.push(player);
                    }
                    else if (player.choice == Utils_1.CHOICE.MORETHAN7 && this.choosenNum > 7) {
                        winnerCount++;
                        winners.push(player);
                    }
                    player.choice = null;
                }
                //Divide win money accoridng to winner
                let winAmount = this.totalPotAmount / winnerCount;
                for (let i = 0; i < winners.length; i++) {
                    //Send the number to player and choose winner
                    let result = yield apicalls_1.callUpdateCoinWalletAPI(winners[i].playerID, this.tableGameId, winAmount.toString(), "PLAYER_WIN", true, "Player win for guess number choice: " + winners[i].choice + " correct num: " + this.choosenNum);
                    winners[i].sendMessage({ t: "win", data: winAmount });
                    winners[i].balance = result.coinBalance;
                    this.sendMessageToAll({ t: "pBal", id: i, bal: result.coinBalance });
                    if (result) {
                        console.log("Processed player win sucess");
                    }
                    else {
                        console.log("ERROR could not process player win pl:" + winners[i].playerID + " win amt: " + winAmount);
                    }
                }
                this.sendMessageToAll({ t: "gResult", data: this.choosenNum });
                yield apicalls_1.callTableGameEndingAPI(this.gameId, this.tableGameId);
                this.restartGame();
            }
            else {
                this.gamePlayTimer--;
                console.log("this.gamePlayTimer:" + this.gamePlayTimer);
                this.sendMessageToAll({ t: "gTimer", data: this.gamePlayTimer });
                this.gamePlayTimeout = setTimeout(this.gamePlayLoop.bind(this), 1000);
            }
        });
    }
    callAutoRefill(plRoomId) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield apicalls_1.callAutoRefillAPI(this.PlayersUniqIdDict[plRoomId].playerID, this.tableGameId);
            console.log(result);
            this.PlayersUniqIdDict[plRoomId].balance = result.coinBalance;
            this.sendMessageToAll({ t: "pBal", id: plRoomId, bal: result.coinBalance });
        });
    }
    restartGame() {
        this.choosenNum = null;
        this.totalPotAmount = 0;
        this.gamePlayTimer = 15;
        this.countDown = 15;
        this.gameStarted = false;
        if (this.currentPlayersCount == this.maxPlayers) {
            clearTimeout(this.countDownTimeOut);
            apicalls_1.callTableGameStartingAPI(this.gameId, this.tableGameId);
            this.startGame();
        }
        else if (this.currentPlayersCount >= this.minPlayers && !this.countdownStarted && !this.gameStarted) {
            this.countdownStarted = true;
            this.countDownTimeOut = setTimeout(this.decreaseCountDownTimer.bind(this), 1000);
        }
    }
}
exports.TableGameRoom = TableGameRoom;
//# sourceMappingURL=TableGameRoom.js.map