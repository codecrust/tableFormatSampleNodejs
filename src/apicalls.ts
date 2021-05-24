import { createANewPlayer, ExtWebSocket, unirest } from "./server";
const axios = require('axios');
axios.defaults.headers.post['x-auth-key'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywibW9iaWxlIjoiOTMxMjA5ODk2OCIsInNlc3Npb25JZCI6ImticmQ0Y3E2QlYiLCJpYXQiOjE1ODQ0MzkzMTd9.XjKspPyF1rMNim6cJb5JSGXjHqMg3lpeBOkYgYD1gJg' // for POST requests
axios.defaults.headers.get['x-auth-key'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywibW9iaWxlIjoiOTMxMjA5ODk2OCIsInNlc3Npb25JZCI6ImticmQ0Y3E2QlYiLCJpYXQiOjE1ODQ0MzkzMTd9.XjKspPyF1rMNim6cJb5JSGXjHqMg3lpeBOkYgYD1gJg' // for POST requests

//Get Player Balance AP
export async function callGetPlayerBalanceAPI(playerId: string, tableGameId: string) {

    try {
        console.log("===========callGetPlayerBalanceAPI==========");

        const resp = await axios.get(`https://apiuat.gamesapp.com/api/v1/games/table/playerBalance/${playerId}/${tableGameId}`);
        console.log("@@@@@@Response callGetPlayerBalanceAPI@@@@@@");

        console.log(resp.data);

    } catch (error) {
        console.log(error.response.data);
    }

}


export async function callUpdateCoinWalletAPI(playerId: string, tableGameId: string, amount: string, event: string, deductRake: boolean, remarks: string) {

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
        }


        console.log(postMsg);

        const resp = await axios.post(`https://apiuat.gamesapp.com//api/v1/games/table/user/coinwallet`, postMsg);
        console.log("response of callUpdateCoinWalletAPI ");
        console.log(resp.data);
        return resp.data.data;
    } catch (error) {
        console.log(error.response.data);
        return false;
    }

}



export async function callAutoRefillAPI(playerId: string, tableGameId: string) {

    try {
        ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
        console.log("callAutoRefillAPI");

        let postMsg = {
            playerId: playerId,
            tableGameId: tableGameId
        }

        console.log(postMsg);

        const resp = await axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/autorefill`, postMsg);
        console.log("response of callAutoRefillAPI ");
        console.log(resp.data);
        return resp.data.data
    } catch (error) {
        console.log(error.response.data);
    }

}

export async function callGetTableTypesAPI(gameId: string) {

    try {
        ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
        console.log("==========callGetTableTypesAPI============");

        const resp = await axios.get(`https://apiuat.gamesapp.com/api/v1/games/table/list?gameId=${gameId}`);
        console.log("@@@@@@response of callGetTableTypesAPI@@@@@@@ ");

        console.log(resp.data);

    } catch (error) {
        console.log(error.response.data);
    }

}


export async function callJoinTableAPI(extWs: ExtWebSocket, gameId: string, tableTypeId: string, playerId: string, entryFee: string) {

    try {
        ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
        console.log("=========callJoinTableAPI===========");

        let postMsg = {
            gameId: gameId,
            tableTypeId: tableTypeId,
            playerId: playerId,
            entryFee: entryFee
        }


        const resp = await axios.post(`https://apiuat.gamesapp.com//api/v1/games/table/joinAndAdd`, postMsg);
        console.log("@@@@@@@response of callJoinTableAPI @@@@@@@@@");
        console.log(resp.data);
        let tableGameId = resp.data.data.tableGameId + ""
        console.log(resp.data);
        createANewPlayer(extWs, tableGameId, playerId, resp.data.data.balance);

       // callPlayerAddedToTableAPI(extWs, playerId, tableGameId, entryFee)
        //callGetPlayerBalanceAPI(playerId, tableGameId)

    } catch (error) {
        console.log("@@@@@@@ ERROR => callJoinTableAPI @@@@@@@@");
        console.log(error.response.data);
    }

}

export async function callPlayerAddedToTableAPI(extWs: ExtWebSocket, playerId: string, tableGameId: string, entryFee: string) {

    try {
        ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
        console.log("=============callPlayerAddedToTableAPI==================");

        let postMsg = {
            tableGameId: tableGameId,
            playerId: playerId,
            entryFee: entryFee
        }

        console.log(postMsg);

        const resp = await axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/addPlayer`, postMsg);
        console.log("@@@@@@@ response => PlayerAddedToTableAPI @@@@@@@@");
        console.log(resp.data);
        createANewPlayer(extWs, tableGameId, playerId, resp.data.data.balance);
        //Adding Player To Room

    } catch (error) {
        console.log("@@@@@@@ ERROR => PlayerAddedToTableAPI @@@@@@@@");

        console.log(error.response.data);
    }

}

export async function callPlayerLeftTableAPI(playerId: string, tableGameId: string) {

    try {
        ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
        console.log("=========callPlayerLeftTableAPI============");

        let postMsg = {
            tableGameId: tableGameId,
            playerId: playerId,
        }

        console.log(postMsg);

        const resp = await axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/leftPlayer`, postMsg);
        console.log("response of callPlayerLeftTableAPI ");
        console.log(resp.data);
    } catch (error) {
        console.log("@@@@@@@ ERROR => callPlayerLeftTableAPI @@@@@@@@");

        console.log(error.response.data);
    }

}


export async function callTableGameStartingAPI(gameId: string, tableGameId: string) {

    try {
        ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
        console.log("===========callTableGameStartingAPI=============");

        let postMsg = {
            gameId: gameId,
            tableGameId: tableGameId
        }


        console.log(postMsg);

        const resp = await axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/startGame`, postMsg);
        console.log("response of callTableGameStartingAPI ");
        console.log(resp.data);

    } catch (error) {
        console.log("@@@@@@@ ERROR => callTableGameStartingAPI @@@@@@@@");

        console.log(error.response.data);
    }

}

export async function callTableGameEndingAPI(gameId: string, tableGameId: string) {

    try {
        ///api/v1/games/table/playerBalance/{userId}/{tableGameId}
        console.log("===========callTableGameEndingAPI===============");

        let postMsg = {
            gameId: gameId,
            tableGameId: tableGameId
        }

        console.log(postMsg);

        const resp = await axios.post(`https://apiuat.gamesapp.com/api/v1/games/table/endGame`, postMsg);
        console.log("response of callTableGameEndingAPI ");
        console.log(resp.data);

    } catch (error) {
        console.log("@@@@@@@ ERROR => callTableGameEndingAPI @@@@@@@@");

        console.log(error.response.data);
    }

}