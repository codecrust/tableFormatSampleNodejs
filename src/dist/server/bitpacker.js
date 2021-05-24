"use strict";
//import { wrapRotation } from "./Utils"
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexDump = exports.SerializePosition = exports.serializeDataInPacket = exports.serializeRandInPacket = exports.serializeTimeInPacket = exports.serializeTest = exports.serializeTypeInPacket = exports.BitReader = exports.BitPacker = void 0;
const ID_SIZE = 16;
const MAP_SIZE_X = 19;
const MAP_SIZE_Y = 19;
const MAP_SIZE_Z = 19;
const PARTS_SIZE = 3;
const PARTS_AMOUNT_SIZE = 8;
const WORD_SIZE = 32;
const BYTES_PER_ELEMENT = 4;
const BUFFER_SIZE = 128; // 128 * 4 = 512 bytes
class BitPacker {
    constructor() {
        this.scratch = 0;
        this.scratchBits = 0;
        this.wordIndex = 0;
        this.buffer = new Uint32Array(BUFFER_SIZE);
    }
    serializeBits(value, length) {
        this.scratch = this.scratch | value << this.scratchBits;
        this.scratchBits += length;
        if (this.scratchBits >= WORD_SIZE) {
            this.buffer[this.wordIndex] = this.scratch;
            this.wordIndex += 1;
            this.scratchBits -= WORD_SIZE;
            this.scratch = (this.scratchBits > 0)
                ? value >>> (length - this.scratchBits) : 0;
        }
        return value;
    }
    flush() {
        const byteLength = (this.wordIndex * WORD_SIZE / 8)
            + Math.ceil(this.scratchBits / 8);
        this.buffer[this.wordIndex] = this.scratch;
        this.scratch = 0;
        this.scratchBits = 0;
        this.wordIndex = 0;
        // switch to using ArrayBuffer.transfer() when possible
        return this.buffer.buffer.slice(0, byteLength);
    }
}
exports.BitPacker = BitPacker;
class BitReader {
    constructor() {
        this.scratch = 0;
        this.scratchBits = 0;
        this.totalBits = 0;
        this.numBitsRead = 0;
        this.wordIndex = -1;
        this.buffer;
    }
    // there's definitely room to optimize here!
    serializeBits(value, length) {
        let offset = 0;
        let temp;
        let result;
        if (this.scratchBits < length) {
            this.wordIndex += 1;
            // store any overflow since we can't scratch beyond 32 bits
            if (this.wordIndex > 0 && this.scratchBits > 0) {
                temp = this.scratch & ((1 << this.scratchBits) - 1);
                offset = length - this.scratchBits;
            }
            this.scratch = this.buffer[this.wordIndex];
            this.scratchBits = WORD_SIZE;
        }
        if (offset) {
            result = this.scratch & ((1 << offset) - 1);
            result = temp | (result << (length - offset));
            this.scratch = this.scratch >>> offset;
            this.scratchBits -= offset;
        }
        else {
            result = (length < WORD_SIZE)
                ? this.scratch & ((1 << length) - 1) : this.scratch;
            this.scratch = this.scratch >>> length;
            this.scratchBits -= length;
        }
        this.numBitsRead += length;
        return result;
    }
    setBuffer(packet) {
        // forcing the packet length to a factor of 4 for the typed array
        const bufferLength = Math.ceil(packet.byteLength / BYTES_PER_ELEMENT);
        this.buffer = new Uint32Array(bufferLength);
        this.totalBits = packet.byteLength * 8;
        // switch to using ArrayBuffer.transfer() when possible
        const packetValues = new Uint8Array(packet);
        const bufferValues = new Uint8Array(this.buffer.buffer);
        bufferValues.set(packetValues);
    }
}
exports.BitReader = BitReader;
function serializeTypeInPacket(stream, { type } = { type: 0 }) {
    let returnObj = { type: 0 };
    stream.serializeBits(type, 3);
    return returnObj;
}
exports.serializeTypeInPacket = serializeTypeInPacket;
function serializeTest(stream, { a, b, c } = { a: 5, b: 6, c: 4 }) {
    let returnObj = { a: 5, b: 6, c: 4 };
    returnObj.a = stream.serializeBits(a, 7);
    returnObj.a = stream.serializeBits(b, 7);
    returnObj.a = stream.serializeBits(c, 7);
    return returnObj;
}
exports.serializeTest = serializeTest;
function serializeTimeInPacket(stream, { time } = { time: 0 }) {
    let returnObj = { time: 0 };
    stream.serializeBits(time, 11);
    return returnObj;
}
exports.serializeTimeInPacket = serializeTimeInPacket;
function serializeRandInPacket(stream, { rand } = { rand: 0 }) {
    let returnObj = { rand: 0 };
    stream.serializeBits(rand, 7);
    return returnObj;
}
exports.serializeRandInPacket = serializeRandInPacket;
function serializeDataInPacket(stream, { data } = { data: 0 }) {
    let returnObj = { data: 0 };
    stream.serializeBits(data, 7);
    return returnObj;
}
exports.serializeDataInPacket = serializeDataInPacket;
function SerializePosition(stream, { id, x, y, z, ry } = { id: -1, x: 0, y: 0, z: 0, ry: 0 }) {
    let returnObj = {};
    returnObj.id = stream.serializeBits(id, 5);
    returnObj.x = stream.serializeBits(x, 14);
    returnObj.y = stream.serializeBits(y, 14);
    returnObj.z = stream.serializeBits(z, 14);
    returnObj.ry = stream.serializeBits(ry, 8);
    return returnObj;
}
exports.SerializePosition = SerializePosition;
/*
export function serializeShowPacket(stream: BitPacker | BitReader, { id, t, x, y, r, h, spray } = { id: 0, t: 0, x: 0, y: 0, r: 0, h: 0, spray: 0 }) {
    let returnObj = { id: 0, t: 0, x: 0, y: 0, r: 0, h: 0, spray: 0 }
    returnObj.id = stream.serializeBits(id, ID_SIZE)
    returnObj.t = stream.serializeBits(t, 3)
    returnObj.x = stream.serializeBits(x, MAP_SIZE_XY)
    returnObj.y = stream.serializeBits(y, MAP_SIZE_XY)
    r = Math.trunc(wrapRotation(r));
    returnObj.r = stream.serializeBits(r, 9)
    h = Math.trunc(h)
    returnObj.h = stream.serializeBits(h, 7)
    returnObj.spray = stream.serializeBits(spray, 1)

    //console.log(returnObj)
    return returnObj;
}


export function serializeFireBulletPacket(stream: BitPacker | BitReader, { id, x, y, r } = { id: 0, x: 0, y: 0, r: 0 }) {
    let returnObj = { id: 0, x: 0, y: 0, r: 0, idb: 0 }
    returnObj.id = stream.serializeBits(id, ID_SIZE)
    returnObj.x = stream.serializeBits(x, MAP_SIZE_XY)
    returnObj.y = stream.serializeBits(y, MAP_SIZE_XY)
    r = Math.trunc(wrapRotation(r));
    returnObj.r = stream.serializeBits(r, 9)
    return returnObj;
}


export function serializeId(stream: BitPacker | BitReader, { id } = { id: 0 }) {
    stream.serializeBits(id, ID_SIZE)
}

export function serializeShipPacket(stream: BitPacker | BitReader, { id, x, y, r, type, health } = { id: 0, x: 0, y: 0, r: 0, type: 0, health: 0 }) {
    x = ((x / 20) + 8)
    y = ((y / 20) + 8)
    stream.serializeBits(id, PARTS_AMOUNT_SIZE)

    stream.serializeBits(x, 4)
    stream.serializeBits(y, 4)
    stream.serializeBits(r, 2)
    stream.serializeBits(type, PARTS_SIZE)
    stream.serializeBits(health, 7)

}




export function serializeStatsPacket(stream: BitPacker | BitReader, { pCount, vCount } = { pCount: 0, vCount: 0 }) {
    let returnObj = { pCount: 0, vCount: 0 }
    returnObj.pCount = stream.serializeBits(pCount, 16)
    returnObj.vCount = stream.serializeBits(vCount, 16)

    return returnObj;
}


export function serializeBulletPacket(stream: BitPacker | BitReader, { id, type, hitPlId, hitIntrId, health } = { id: 0, type: 0, hitPlId: 0, hitIntrId: 0, health: 0 }) {
    let returnObj = { id: 0, type: -1, hitPlId: 0, hitIntrId: 0, health: 0 }

    returnObj.id = stream.serializeBits(id, ID_SIZE)
    returnObj.type = stream.serializeBits(type, 3)
    returnObj.hitPlId = stream.serializeBits(hitPlId, ID_SIZE)

    if (returnObj.type == 0)
        returnObj.hitIntrId = stream.serializeBits(hitIntrId, ID_SIZE)

    returnObj.health = stream.serializeBits(health, 7)

    /* returnObj.x = stream.serializeBits(x, MAP_SIZE_XY)
     returnObj.y = stream.serializeBits(y, MAP_SIZE_XY)
     if (killId != -1)
       returnObj.killId = stream.serializeBits(killId, ID_SIZE)
   */
// r = wrapRotation(r);
// returnObj.r = stream.serializeBits(r, 9)
/*
return returnObj;
}
export function serializeKilledPacket(stream: BitPacker | BitReader, { id } = { id: 0 }) {
let returnObj = { id: 0 }
returnObj.id = stream.serializeBits(id, ID_SIZE)
return returnObj;
}



export function serializePartChangePacket(stream: BitPacker | BitReader, { addOrRemove, id, x, y } = { addOrRemove: 0, id: 0, x: 0, y: 0 }) {
let returnObj = { addOrRemove: 0, id: 0, x: 0, y: 0 }
x = ((x / 20) + 8)
y = ((y / 20) + 8)
returnObj.addOrRemove = stream.serializeBits(addOrRemove, 1)

returnObj.id = stream.serializeBits(id, ID_SIZE)
returnObj.x = stream.serializeBits(x, 4)
returnObj.y = stream.serializeBits(y, 4)
// r = wrapRotation(r);
// returnObj.r = stream.serializeBits(r, 9)
return returnObj;
}


export class PosUpdateObject { x!: number; y!: number; z!: number;; r!: number; t!: number; }
export function serializePosPacket(stream: BitPacker | BitReader, { id, c, x, y, z, r } = { id: 0, c: [0, 0, 0, 0], x: 0, y: 0, z: 0, r: 0 }) {
let returnObj = { id: 0, t: 0, c: 0, x: 0, y: 0, r: 0, h: 0, spray: 0 }
returnObj.id = stream.serializeBits(id, ID_SIZE)
let n: string = ("" + c[0] + c[1] + c[2] + c[3]);
let m = parseInt(parseInt(n, 2).toString(10))
returnObj.c = stream.serializeBits(m, 5)

if (c[3] == 1) {
    r = wrapRotation(r);
    returnObj.r = stream.serializeBits(r, 9)
}

if (c[2] == 1) {
    returnObj.y = stream.serializeBits(y, MAP_SIZE_XY)
}

if (c[1] == 1)
    returnObj.y = stream.serializeBits(y, MAP_SIZE_XY)

if (c[0] == 1)
    returnObj.x = stream.serializeBits(x, MAP_SIZE_XY)


return returnObj;
}
*/
function hexDump(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
exports.hexDump = hexDump;
//# sourceMappingURL=bitpacker.js.map