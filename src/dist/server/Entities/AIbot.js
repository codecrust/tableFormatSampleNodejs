"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
const Entity_1 = require("./Entity");
class AIbot extends Entity_1.Entity {
    constructor(uniqId) {
        super();
        this.uniqId = uniqId;
        this.kills = 0;
        this.position = new Utils_1.vector3(0, 0, 0);
        this.name = 'AIGuest';
    }
}
exports.AIbot = AIbot;
//# sourceMappingURL=AIbot.js.map