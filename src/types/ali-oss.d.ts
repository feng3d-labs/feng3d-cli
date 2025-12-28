declare module 'ali-oss' {
    interface OSSOptions {
        region: string;
        accessKeyId: string;
        accessKeySecret: string;
        bucket: string;
    }

    interface PutResult {
        name: string;
        url: string;
        res: {
            status: number;
            statusCode: number;
        };
    }

    class OSS
    {
        constructor(options: OSSOptions);
        put(name: string, file: string | Buffer): Promise<PutResult>;
    }

    export = OSS;
}

