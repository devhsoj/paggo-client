import { Socket } from 'node:net';

type ConnectionOptions = {
    host: string,
    port: number,
    maxKeySize: number,
    maxValueSize: number
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
    success: boolean;
    data: Uint8Array;

    constructor(success: boolean, data: Uint8Array) {
        this.success = success;
        this.data = data;
    }

    public toString() {
        return String.fromCharCode(...this.data);
    }

    public toBoolean() {
        return this.data[0] == 1;
    }
}

export class Client {
    options: ConnectionOptions;

    private socket: Socket;

    constructor(options: ConnectionOptions = {
        host: 'localhost',
        port: 9055,
        maxKeySize: 32,
        maxValueSize: 1_024
    }) {
        this.options = options;
        this.socket = new Socket();
    }
    
    public async connect() {
        await new Promise<void>((resolve) => {
            this.socket.connect(this.options.port, this.options.host, resolve);
        });
    }

    public close() {

        this.socket.destroy();

    }

    private generateKey(key: string): string {
        return key + '\x00'.repeat(this.options.maxKeySize - key.length);
    }

    public async get(key: string) {
        this.socket.write(`${Commands.GET}${this.generateKey(key)}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', (data) => resolve(Uint8Array.from(data)));
        });

        return new Response(true, res);
    }

    public async set(key: string, value: string) {
        this.socket.write(`${Commands.SET}${this.generateKey(key)}${value}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', (data) => resolve(Uint8Array.from(data)));
        });

        return res[0] === 1;
    }

    public async exists(key: string) {
        this.socket.write(`${Commands.EXISTS}${this.generateKey(key)}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', (data) => resolve(Uint8Array.from(data)));
        });

        return res[0] === 1;
    }

    public async delete(key: string) {
        this.socket.write(`${Commands.DELETE}${this.generateKey(key)}`);

        const res = await new Promise<Uint8Array>((resolve) => {
            this.socket.once('data', (data) => resolve(Uint8Array.from(data)));
        });

        return res[0] === 1;
    }
}