export const Commands = {
    QUIT: 0x1,
    GET: 0x2,
    SET: 0x3,
    EXISTS: 0x4,
    DELETE: 0x5,
    PING: 0x6,
    UNKNOWN: 0xFF
} as const;
