import { CONNECTING } from "ws";
import { ExtWebSocket } from "../server";
import { TableGameRoom } from "./TableGameRoom";





export class Player {
    plRoomNetId: number = -1;
    gRoom: TableGameRoom | null = null;


    choice: number |null = null;
    balance: number=-1;






    constructor(
        public plSocket: ExtWebSocket,
        public tableGameID: string,
        public playerID: string

    ) {
    }

    //id of game session player is inside

    sendMessage(content: any, isBinary: boolean = false) {

        if (this.plSocket) {
            if (isBinary)
                this.plSocket.send(content);
            else {
                this.plSocket.send(JSON.stringify(content));
            }
        }
    }

}
