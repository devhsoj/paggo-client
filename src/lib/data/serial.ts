import { encodeUint8ArrayToNumber } from './encoding';

type BufferEncoding =
    | 'ascii'
    | 'utf8'
    | 'utf-8'
    | 'utf16le'
    | 'ucs2'
    | 'ucs-2'
    | 'base64'
    | 'base64url'
    | 'latin1'
    | 'binary'
    | 'hex';

export class SerialResponse {
    data: Uint8Array | null;

    constructor(data: Uint8Array | null) {
        this.data = data;
    }

    public toString(encoding?: BufferEncoding) {
        if (!this.data) {
            return '';
        }

        return Buffer.from(this.data).toString(encoding);
    }

    public toBoolean() {
        if (!this.data) {
            return false;
        }

        return this.data[0] == 1;
    }

    public toNumber() {
        if (!this.data) {
            return 0;
        }

        return encodeUint8ArrayToNumber(this.data);
    }
}

export type SerializableValue = string | Uint8Array | number;