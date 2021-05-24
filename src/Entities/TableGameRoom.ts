import { callAutoRefillAPI, callGetPlayerBalanceAPI, callPlayerLeftTableAPI, callTableGameEndingAPI, callTableGameStartingAPI, callUpdateCoinWalletAPI } from "../apicalls";
import { GameRoomsDict } from "../server";
import { Player } from "./Player";
import { CHOICE } from "./Utils";

export class TableGameRoom {


    constructor(public tableGameId: string, public gameId: string, public tableTypeId: string) {

    }


    public minPlayers: number = 1;
    public maxPlayers: number = 4;

    public PlayersUniqIdDict: { [id: string]: Player; } = {};


    currentPlayersCount: number = 0;


    addPlayerToRoom(pl: Player, playerBal: number) {


        if (this.currentPlayersCount == this.maxPlayers || this.gameStarted) {
            callPlayerLeftTableAPI(pl.playerID, pl.tableGameID)
            return
        }



        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] == null) {
                this.PlayersUniqIdDict[i] = pl;
                pl.plRoomNetId = i;
                break;
            }



        pl.gRoom = this;
        pl.balance = playerBal

        let playerAddedMsg = {
            t: "pAdd",
            data: pl.plRoomNetId,
            bal: pl.balance
        };

        pl.sendMessage({ t: "joined", data: pl.plRoomNetId, bal: pl.balance, snap: this.getRoomSnap(pl.plRoomNetId) })
        this.sendMessageToOthers(playerAddedMsg, pl.plRoomNetId)
        this.currentPlayersCount++;

        if (this.currentPlayersCount >= this.minPlayers && !this.countdownStarted) {
            this.countdownStarted = true;
            this.countDownTimeOut = setTimeout(this.decreaseCountDownTimer.bind(this), 1000)
        }
    }




    removePlayerFromRoom(pl: Player) {

        delete this.PlayersUniqIdDict[pl.plRoomNetId];
        this.sendMessageToAll({ t: "pLeft", data: pl.plRoomNetId })

        this.currentPlayersCount--;
        callPlayerLeftTableAPI(pl.playerID, pl.tableGameID)

        //  if (this.currentPlayersCount == 0) {
        //      callTableGameEndingAPI(this.gameId, this.tableGameId)
        // }
    }


    sendMessageToOthers(content: any, plRoomNetId: number) {
        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] != null && i != plRoomNetId && this.PlayersUniqIdDict[i]) {
                this.PlayersUniqIdDict[i].sendMessage(content);
            }
    }

    sendMessageToAll(content: any) {
        for (let i = 0; i < this.maxPlayers; i++)
            if (this.PlayersUniqIdDict[i] != null)
                this.PlayersUniqIdDict[i].sendMessage(content);

    }

    getRoomSnap(plRoomNetId: number) {

        let currPlsData = [];
        for (let i = 0; i < this.maxPlayers; i++) {
            let player = this.PlayersUniqIdDict[i]
            if (player == null || player.plRoomNetId == plRoomNetId)
                continue;

            currPlsData.push({
                id: player.plRoomNetId,
                bal: player.balance
            });
        }

        return currPlsData;
    }

    countDown: number = 15;
    countDownTimeOut: any
    gamePlayTimeout: any
    gamePlayTimer: any = 15;
    decreaseCountDownTimer() {

        //send update to everyone about lobby timer
        this.countDown--;
        console.log("CountDown Room:"+this.tableGameId+" =>" + this.countDown)

        this.sendMessageToAll({ t: "timer", data: this.countDown });

        //Reset timer
        if (this.countDown == 0) {
            this.gameStarted = true;
            if (this.currentPlayersCount >= this.minPlayers) {
                callTableGameStartingAPI(this.gameId, this.tableGameId)
                this.startGame();
            } else {
                delete GameRoomsDict[this.tableGameId]
            }

        } else {

            this.countDownTimeOut = setTimeout(this.decreaseCountDownTimer.bind(this), 1000)
        }
    }


    gameStarted: boolean = false;
    countdownStarted: boolean = false

    startGame() {
        this.gameStarted = true;
        this.countdownStarted = false;

        this.gamePlayTimeout = setTimeout(this.gamePlayLoop.bind(this), 1000)

    }

    async getPlayerBet(plRoomId: number, plChoice: number) {
        if (this.gamePlayTimer < 5 || this.gamePlayTimer < 0) {
            console.log("Bets closed")
            return;
        }

        let pl = this.PlayersUniqIdDict[plRoomId] as Player;

        if (pl.choice != null) {
            console.log("Player choice already recorded")
            return;
        }

        let choice = plChoice as number
        console.log("before calling call coin wallet pl:" + pl.playerID)
        let result = await callUpdateCoinWalletAPI(pl.playerID, this.tableGameId, "-2", "PLAYER_BET", false, "Player Bet for guess number choice: " + choice)
        if (result) {
            this.totalPotAmount += 2;

            console.log("after coin wallet update pl:" + pl.playerID)
            pl.choice = choice;
            pl.balance = result.coinBalance
            this.sendMessageToAll({ t: "pBal", id: pl.plRoomNetId, bal: pl.balance })
            this.sendMessageToAll({ t: "pChoice", id: pl.plRoomNetId, choice: CHOICE[pl.choice] })

            console.log("Player Choice = " + CHOICE[pl.choice])
        } else {
            console.log("ERROR FAILED TO REGISTER PLAYER BET")
        }

    }

    choosenNum: null | number = null;
    totalPotAmount: number = 0;
    async gamePlayLoop() {


        if (this.gamePlayTimer == 0) {


            //choose a number
            this.choosenNum = 5// 1+ Math.round(Math.random() * 6) + 1+ Math.round(Math.random() * 6)

            let winnerCount = 0;
            let winners = []
            for (let i = 0; i < this.maxPlayers; i++) {
                let player = this.PlayersUniqIdDict[i]
                if (player == null || player.choice == null)
                    continue;

                if (player.choice == CHOICE.LESSTHAN7 && this.choosenNum < 7) {
                    winnerCount++;
                    winners.push(player)
                }
                else if (player.choice == CHOICE.EQUAL7 && this.choosenNum == 7) {
                    winnerCount++;
                    winners.push(player)

                } else if (player.choice == CHOICE.MORETHAN7 && this.choosenNum > 7) {
                    winnerCount++;
                    winners.push(player)

                }
                player.choice = null
            }


            //Divide win money accoridng to winner
            let winAmount = this.totalPotAmount / winnerCount;

            for (let i = 0; i < winners.length; i++) {
                //Send the number to player and choose winner
                let result = await callUpdateCoinWalletAPI(winners[i].playerID, this.tableGameId, winAmount.toString(), "PLAYER_WIN", true, "Player win for guess number choice: " + winners[i].choice + " correct num: " + this.choosenNum)
                winners[i].sendMessage({ t: "win", data: winAmount })
                winners[i].balance = result.coinBalance
                this.sendMessageToAll({ t: "pBal", id: i, bal: result.coinBalance })

                if (result) {
                    console.log("Processed player win sucess")
                }
                else {
                    console.log("ERROR could not process player win pl:" + winners[i].playerID + " win amt: " + winAmount)
                }
            }
            this.sendMessageToAll({ t: "gResult", data: this.choosenNum })
            await callTableGameEndingAPI(this.gameId, this.tableGameId);
            this.restartGame();
        }
        else {
            this.gamePlayTimer--
            console.log("gameTimer Room: "+this.tableGameId+" =>" + this.gamePlayTimer)

            this.sendMessageToAll({ t: "gTimer", data: this.gamePlayTimer })
            this.gamePlayTimeout = setTimeout(this.gamePlayLoop.bind(this), 1000)

        }
    }

    async callAutoRefill(plRoomId: number) {
        let result = await callAutoRefillAPI(this.PlayersUniqIdDict[plRoomId].playerID, this.tableGameId)
        console.log(result)
        this.PlayersUniqIdDict[plRoomId].balance = result.coinBalance
        this.sendMessageToAll({ t: "pBal", id: plRoomId, bal: result.coinBalance })


    }



    restartGame() {
        this.choosenNum = null;
        this.totalPotAmount = 0;
        this.gamePlayTimer = 15;
        this.countDown = 15;
        this.gameStarted = false;
        if (this.currentPlayersCount == this.maxPlayers) {
            clearTimeout(this.countDownTimeOut)
            callTableGameStartingAPI(this.gameId, this.tableGameId);
            this.startGame();
        }
        else if (this.currentPlayersCount >= this.minPlayers) {
            this.countdownStarted = true;
            this.countDownTimeOut = setTimeout(this.decreaseCountDownTimer.bind(this), 1000)
        } else {
            delete GameRoomsDict[this.tableGameId];
        }
    }

}