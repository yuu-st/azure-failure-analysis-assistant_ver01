import { BlobServiceClient, ContainerClient} from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { Logger } from "./logger.js";
import { streamToString } from "./utils.js";

/**
 * AzureStorageBlob provides methods for interacting with Azure Blob Storage.
 */
export class AzureStorageBlobClient {
  private azureStrageConnectionString: string;
  private storageAccountName: string;
  private containerName: string;
  private logger: Logger;
  private containerClient: ContainerClient;
  
  /**
   * Creates an instance of AzureStorageBlob.
   *
   * @param logger - Logger instance for structured logging
   */
  constructor(logger: Logger, azureStrageConnectionString: string, storageAccountName: string, containerName: string) {
    
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
    const blobServiceClient = BlobServiceClient.fromConnectionString(this.azureStrageConnectionString);

    this.containerClient = blobServiceClient.getContainerClient(this.containerName);
  }

  /**
   * Loads all blobs from the container and returns their contents.
   *
   * @returns A map of blob names to their string contents.
   */
  public async loadAllBlobs(): Promise<Record<string, string>> {
    const input: Record<string, string> = {};

    this.logger.info(`Reading blobs from container: "${this.containerName}"...`);
    try {
        for await (const blob of this.containerClient.listBlobsFlat()) {
            const blobClient = this.containerClient.getBlobClient(blob.name);
            const response = await blobClient.download();
            
            if (response.readableStreamBody) {
                const content = await streamToString(
                    this.logger, response.readableStreamBody as NodeJS.ReadableStream,
                );
                input[blob.name] = content;
                this.logger.info(`Successfully read: ${blob.name}`);
            } else {
                this.logger.warn(`No stream found for: ${blob.name}`);
            }
        }
        
        this.logger.info("All blobs have been processed.");
        return input;
    } catch (err) {
        this.logger.error("Error occurred while loading blobs:", err);
        throw err;
    }
  }

}