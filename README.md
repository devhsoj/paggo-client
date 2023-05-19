# paggo-client-ts

A TypeScript client library for [paggo](https://github.com/devhsoj/paggo).

## Installation

```bash
npm i @paggo/client
```

## Example Usage

```typescript
import { Client } from '@paggo/client';

(async () => {
    const client = new Client();

    await client.connect();

    await client.set('test', 'test');

    const exists = await client.exists('test');

    if (exists) {
        const data = await client.get('test');

        console.log(data.toString());
    }

    await client.delete('test');

    client.close();
})();
```

## License

[MIT](https://choosealicense.com/licenses/mit/)