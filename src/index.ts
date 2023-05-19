import { Socket } from 'node:net';

type ConnectionOptions = {
    host: string,
    port: number,
    maxKeySizeBytes: number,
    maxValueSizeBytes: number
}

const Commands = {
    QUIT: '\x01',
    GET: '\x02',
    SET: '\x03',
    EXISTS: '\x04',
    DELETE: '\x05',
    UNKNOWN: '\xFF'
} as const;

class Response {
    data: Uint8Array | null;

    constructor(data: Uint8Array | null) {
        this.data = data;
    }

    public toString() {
        if (!this.data) {
            return '';
        }

        return String.fromCharCode(...this.data).replaceAll('\x00', '');
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

        return parseInt(this.toString());
    }
}

type SerializableValue = string | Uint8Array | number;

export class Client {
    options: ConnectionOptions;

    private socket: Socket;

    constructor(options: ConnectionOptions = {
        host: 'localhost',
        port: 9055,
        maxKeySizeBytes: 32,
        maxValueSizeBytes: 1_024
    }) {
        this.options = options;
        this.socket = new Socket();

        this.socket.setNoDelay(true);
    }

    private validateKey(key: string) {
        if (key.length > this.options.maxKeySizeBytes) {
            throw `key '${key}' too long (> ${ this.options.maxKeySizeBytes } b)`;
        }
    }

    private validateValue(value: SerializableValue) {
        if (typeof value === 'number') {
            value = value.toString();
        }

        if (value.length > this.options.maxValueSizeBytes) {
            throw `value too long (> ${ this.options.maxValueSizeBytes } b)`;
        }
    }

    private serializeKey(key: string): string {
        this.validateKey(key);

        return key + '\x00'.repeat(this.options.maxKeySizeBytes - key.length);
    }
    
    public async connect() {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let rejectCallback: (reason?: any) => void = () => {};

        await new Promise<void>((resolve, reject) => {
            this.socket.connect(this.options.port, this.options.host, resolve);

            rejectCallback = reject;
            this.socket.once('error', rejectCallback);
        });

        this.socket.removeListener('error', rejectCallback);
    }

    public close() {

        this.socket.destroy();

    }

    public async get(key: string) {
        this.validateKey(key);
        this.socket.write(`${Commands.GET}${this.serializeKey(key)}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', (data) => resolve(Uint8Array.from(data)));
        });

        return new Response(res);
    }

    public async set(key: string, value: SerializableValue) {
        this.validateKey(key);
        this.validateValue(value);

        this.socket.write(`${Commands.SET}${this.serializeKey(key)}${value}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', resolve);
        });

        return res[0] === 1;
    }

    public async exists(key: string) {
        this.validateKey(key);
        this.socket.write(`${Commands.EXISTS}${this.serializeKey(key)}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', resolve);
        });

        return res[0] === 1;
    }

    public async delete(key: string) {
        this.validateKey(key);
        this.socket.write(`${Commands.DELETE}${this.serializeKey(key)}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', resolve);
        });

        return res[0] === 1;
    }
}