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
exports.callTableGameEndingAPI = exports.callTableGameStartingAPI = exports.callPlayerLeftTableAPI = exports.callPlayerAddedToTableAPI = exports.callJoinTableAPI = exports.callGetTableTypesAPI = exports.callAutoRefillAPI = exports.callUpdateCoinWalletAPI = exports.callGetPlayerBalanceAPI = void 0;
const server_1 = require("./server");
const axios = require('axios');
axios.defaults.headers.post['x-auth-key'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywibW9iaWxlIjoiOTMxMjA5ODk2OCIsInNlc3Npb25JZCI6ImticmQ0Y3E2QlYiLCJpYXQiOjE1ODQ0MzkzMTd9.XjKspPyF1rMNim6cJb5JSGXjHqMg3lpeBOkYgYD1gJg'; // for POST requests
axios.defaults.headers.get['x-auth-key'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywibW9iaWxlIjoiOTMxMjA5ODk2OCIsInNlc3Npb25JZCI6ImticmQ0Y3E2QlYiLCJpYXQiOjE1ODQ0MzkzMTd9.XjKspPyF1rMNim6cJb5JSGXjHqMg3lpeBOkYgYD1gJg'; // for POST requests
//Get Player Balance AP
function callGetPlayerBalanceAPI(playerId, tableGameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("===========callGetPlayerBalanceAPI==========");
            const resp = yield axios.get(`https://apiuat.gamesapp.com/api/v1/games/table/playerBalance/${playerId}/${tableGameId}`);
            console.log("@@@@@@Response callGetPlayerBalanceAPI@@@@@@");
            console.log(resp.data);
        }
        catch (error) {
            console.log(error.response.data);
        }
    });
}
exports.callGetPlayerBalanceAPI = callGetPlayerBalanceAPI;
function callUpdateCoinWalletAPI(playerId, tableGameId, amount, event, deductRake, remarks) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("===========callUpdateCoinWalletAPI==========");
            let postMsg = {
                amount: amount,
                tableGameId: tableGameId,
                playerId: playerId,
                event: event,
                deductRake: deductRake,
                remarks: remarks
            };
            console.log(postMsg);
            const resp = yield axios.post(`https://apiuat.gamesapp.com//api/v1/games/table/user/coinwallet`, postMsg);
            console.log("response of callUpdateCoinWalletAPI ");
            console.log(resp.data);
            return resp.data.data;
        }
        catch (error) {
            console.log(error.response.data);
            return false;
        }
    });
}
exports.callUpdateCoinWalletAPI = callUpdateCoinWalletAPI;
function callAutoRefillAPI(playerId, tableGameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("callAutoRefillAPI");
            let postMsg = {
                playerId: playerId,
                tableGameId: tableGameId
            };
            console.log(postMsg);
            const resp = yield axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/autorefill`, postMsg);
            console.log("response of callAutoRefillAPI ");
            console.log(resp.data);
            return resp.data.data;
        }
        catch (error) {
            console.log(error.response.data);
        }
    });
}
exports.callAutoRefillAPI = callAutoRefillAPI;
function callGetTableTypesAPI(gameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("==========callGetTableTypesAPI============");
            const resp = yield axios.get(`https://apiuat.gamesapp.com/api/v1/games/table/list?gameId=${gameId}`);
            console.log("@@@@@@response of callGetTableTypesAPI@@@@@@@ ");
            console.log(resp.data);
        }
        catch (error) {
            console.log(error.response.data);
        }
    });
}
exports.callGetTableTypesAPI = callGetTableTypesAPI;
function callJoinTableAPI(extWs, gameId, tableTypeId, playerId, entryFee) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("=========callJoinTableAPI===========");
            let postMsg = {
                gameId: gameId,
                tableTypeId: tableTypeId,
                playerId: playerId,
                entryFee: entryFee
            };
            const resp = yield axios.post(`https://apiuat.gamesapp.com//api/v1/games/table/joinAndAdd`, postMsg);
            console.log("@@@@@@@response of callJoinTableAPI @@@@@@@@@");
            console.log(resp.data);
            let tableGameId = resp.data.data.tableGameId + "";
            console.log(resp.data);
            server_1.createANewPlayer(extWs, tableGameId, playerId, resp.data.data.balance);
            // callPlayerAddedToTableAPI(extWs, playerId, tableGameId, entryFee)
            //callGetPlayerBalanceAPI(playerId, tableGameId)
        }
        catch (error) {
            console.log("@@@@@@@ ERROR => callJoinTableAPI @@@@@@@@");
            console.log(error.response.data);
        }
    });
}
exports.callJoinTableAPI = callJoinTableAPI;
function callPlayerAddedToTableAPI(extWs, playerId, tableGameId, entryFee) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("=============callPlayerAddedToTableAPI==================");
            let postMsg = {
                tableGameId: tableGameId,
                playerId: playerId,
                entryFee: entryFee
            };
            console.log(postMsg);
            const resp = yield axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/addPlayer`, postMsg);
            console.log("@@@@@@@ response => PlayerAddedToTableAPI @@@@@@@@");
            console.log(resp.data);
            server_1.createANewPlayer(extWs, tableGameId, playerId, resp.data.data.balance);
            //Adding Player To Room
        }
        catch (error) {
            console.log("@@@@@@@ ERROR => PlayerAddedToTableAPI @@@@@@@@");
            console.log(error.response.data);
        }
    });
}
exports.callPlayerAddedToTableAPI = callPlayerAddedToTableAPI;
function callPlayerLeftTableAPI(playerId, tableGameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("=========callPlayerLeftTableAPI============");
            let postMsg = {
                tableGameId: tableGameId,
                playerId: playerId,
            };
            console.log(postMsg);
            const resp = yield axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/leftPlayer`, postMsg);
            console.log("response of callPlayerLeftTableAPI ");
            console.log(resp.data);
        }
        catch (error) {
            console.log("@@@@@@@ ERROR => callPlayerLeftTableAPI @@@@@@@@");
            console.log(error.response.data);
        }
    });
}
exports.callPlayerLeftTableAPI = callPlayerLeftTableAPI;
function callTableGameStartingAPI(gameId, tableGameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("===========callTableGameStartingAPI=============");
            let postMsg = {
                gameId: gameId,
                tableGameId: tableGameId
            };
            console.log(postMsg);
            const resp = yield axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/startGame`, postMsg);
            console.log("response of callTableGameStartingAPI ");
            console.log(resp.data);
        }
        catch (error) {
            console.log("@@@@@@@ ERROR => callTableGameStartingAPI @@@@@@@@");
            console.log(error.response.data);
        }
    });
}
exports.callTableGameStartingAPI = callTableGameStartingAPI;
function callTableGameEndingAPI(gameId, tableGameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
            console.log("===========callTableGameEndingAPI===============");
            let postMsg = {
                gameId: gameId,
                tableGameId: tableGameId
            };
            console.log(postMsg);
            const resp = yield axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/endGame`, postMsg);
            console.log("response of callTableGameEndingAPI ");
            console.log(resp.data);
        }
        catch (error) {
            console.log("@@@@@@@ ERROR => callTableGameEndingAPI @@@@@@@@");
            console.log(error.response.data);
        }
    });
}
exports.callTableGameEndingAPI = callTableGameEndingAPI;
//# sourceMappingURL=apicalls.js.map