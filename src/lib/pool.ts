import { Client, ConnectionOptions } from './client';
import { SerializableValue } from './data/serial';

export type PoolConnectionOptions = ConnectionOptions & {
    maxClients: number,
    warmup?: boolean
}

export class Pool {
    options: PoolConnectionOptions;

    private clients: Client[];

    constructor(options: PoolConnectionOptions = {
        host: 'localhost',
        port: 9055,
        maxKeySizeBytes: 32,
        maxValueSizeBytes: 1_024,
        maxClients: 4,
        warmup: true
    }) {
        this.options = options;
        this.clients = [];
    }

    public async connect() {
        for (let i = 0; i < this.options.maxClients; i++) {
            await this.createClient();
        }
    }

    public close() {
        for (let i = 0; i < this.clients.length; i++) {
            this.clients[i].close();
        }
    }

    public async ping() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const client = this.clients.shift()!;

        this.clients.push(client);

        return (await client.ping());
    }

    public async get(key: string) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const client = this.clients.shift()!;

        this.clients.push(client);

        return (await client.get(key));
    }

    public async set(key: string, value: SerializableValue) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const client = this.clients.shift()!;

        this.clients.push(client);

        return (await client.set(key, value));
    }

    public async exists(key: string) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const client = this.clients.shift()!;

        this.clients.push(client);

        return (await client.exists(key));
    }

    public async delete(key: string) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const client = this.clients.shift()!;

        this.clients.push(client);

        return (await client.delete(key));
    }

    private async createClient() {
        const client = new Client(this.options);

        await client.connect();

        if (this.options.warmup) {
            await client.ping();
        }

        this.clients.push(client);
    }
}