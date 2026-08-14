export declare const encrypt: (buffer: Buffer) => {
    encrypted: Buffer<ArrayBuffer>;
    iv: NonSharedBuffer;
    authTag: NonSharedBuffer;
};
export declare const decrypt: (encryptedBuffer: Buffer, iv: Buffer, authTag: Buffer) => Buffer<ArrayBuffer>;
//# sourceMappingURL=crypto.d.ts.map