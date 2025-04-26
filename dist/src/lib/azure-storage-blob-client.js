"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureStorageBlobClient = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const utils_js_1 = require("./utils.js");
/**
 * AzureStorageBlob provides methods for interacting with Azure Blob Storage.
 */
class AzureStorageBlobClient {
    /**
     * Creates an instance of AzureStorageBlob.
     *
     * @param logger - Logger instance for structured logging
     */
    constructor(logger, azureStrageConnectionString, storageAccountName, containerName) {
        if (!azureStrageConnectionString || !storageAccountName || !containerName) {
            throw new Error("AZURE_STORAGE_CONNECTION_STRING or STORAGE_ACCOUNT_NAME or CONTAINER_NAME is not defined.");
        }
        this.azureStrageConnectionString = azureStrageConnectionString;
        this.storageAccountName = storageAccountName;
        this.containerName = containerName;
        this.logger = logger;
        // 本番用
        //const url = `https://${this.storageAccountName}.blob.core.windows.net`;
        //const credential = new DefaultAzureCredential();
        //const blobServiceClient = new BlobServiceClient(url, credential);
        /*
        logger.info("environment value", {"azureStrageConnectionString": this.azureStrageConnectionString,
          "storageAccountName": this.storageAccountName,
          "containerName": this.containerName
         });
        */
        // 開発用
        const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(this.azureStrageConnectionString);
        this.containerClient = blobServiceClient.getContainerClient(this.containerName);
    }
    /**
     * Loads all blobs from the container and returns their contents.
     *
     * @returns A map of blob names to their string contents.
     */
    loadAllBlobs() {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const input = {};
            this.logger.info(`Reading blobs from container: "${this.containerName}"...`);
            try {
                try {
                    for (var _d = true, _e = __asyncValues(this.containerClient.listBlobsFlat()), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                        _c = _f.value;
                        _d = false;
                        const blob = _c;
                        const blobClient = this.containerClient.getBlobClient(blob.name);
                        const response = yield blobClient.download();
                        if (response.readableStreamBody) {
                            const content = yield (0, utils_js_1.streamToString)(this.logger, response.readableStreamBody);
                            input[blob.name] = content;
                            this.logger.info(`Successfully read: ${blob.name}`);
                        }
                        else {
                            this.logger.warn(`No stream found for: ${blob.name}`);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                this.logger.info("All blobs have been processed.");
                return input;
            }
            catch (err) {
                this.logger.error("Error occurred while loading blobs:", err);
                throw err;
            }
        });
    }
}
exports.AzureStorageBlobClient = AzureStorageBlobClient;
//# sourceMappingURL=azure-storage-blob-client.js.map