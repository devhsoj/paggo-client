// modified version of the clever answer given by @Younes at https://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
export function encodeNumberToUint8Array(value: number) {
    const bytes = new Uint8Array(8);

    for (let i = 0; i < bytes.length; i++) {
        const byte = value & 255;

        bytes[i] = byte;
        value = (value - byte) / 256;
    }

    return bytes;
}

// modified version of the clever answer given by @Younes at https://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
export function encodeUint8ArrayToNumber(data: Uint8Array) {
    let value = 0;

    for (let i = data.byteLength - 1; i >= 0; i--) {
        value = (value * 256) + data[i];
    }

    return value;
}