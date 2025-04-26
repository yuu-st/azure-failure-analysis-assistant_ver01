import { Logger } from "./logger.js";

/**
 * Converts a Readable stream into a string
 * 
 * @param readableStream - The stream to convert
 * @returns Promise<string> - The resulting string
 */
export async function streamToString(logger: Logger, readableStream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];

        readableStream.on("data", (data: Buffer | Uint8Array) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });

        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks).toString("utf-8"));
        });

        readableStream.on("error", (error) => {
            logger.error("Error while reading stream:", error);
            reject(error);
        });

    });
}