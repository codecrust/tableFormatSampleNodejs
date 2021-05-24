"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovableEntity = void 0;
class MovableEntity {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
        this.hasChanged = true;
    }
    setPos(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.hasChanged = true;
    }
    setRot(rx = 0, ry = 0, rz = 0) {
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.hasChanged = true;
    }
}
exports.MovableEntity = MovableEntity;
//# sourceMappingURL=MovableEntity.js.map