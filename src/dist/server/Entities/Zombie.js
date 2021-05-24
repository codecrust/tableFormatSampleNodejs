"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
const Entity_1 = require("./Entity");
class Zombie extends Entity_1.Entity {
    constructor(phybody) {
        super();
        this.phybody = phybody;
        //   this.position=new vector2(0,0);
        this.prevSentPosition = new Utils_1.vector2(0, 0);
        this.physbody = phybody;
    }
}
exports.Zombie = Zombie;
//# sourceMappingURL=Zombie.js.map