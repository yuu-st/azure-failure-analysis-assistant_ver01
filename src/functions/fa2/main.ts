import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Prompt } from "../../lib/prompts.js";
import { Logger } from "../../lib/logger.js"; 
import { AzureStorageBlobClient } from "../../lib/azure-storage-blob-client.js";
import { AzureOpenAIClient } from "../../lib/azure-openai-client.js";


type RequestBoby = {
  errorDescription: string;
  startDate: string;
  endDate: string;
  channelId: string;
  threadTs: string;
}

export async function httpTrigger(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

  const logger = new Logger(context, "AzureFailureAnalysisAssistant");
 
  //const reqBody = await req.json() as RequestBoby;
  //const { errorDescription, startDate, endDate, channelId, threadTs } = reqBody;
  //logger.info("Request started", reqBody);

  // Environment variables
  //const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
  //const containerName = process.env.CONTAINER_NAME;
  //const lang: Language = process.env.LANG ? (process.env.LANG as Language) : "en";
  //const slackAppTokenKey = process.env.SLACK_APP_TOKEN_KEY!;
  //const architectureDescription = process.env.ARCHITECTURE_DESCRIPTION!;

  //const token = await getSecret(slackAppTokenKey);
  //const messageClient = new MessageClient(token!.toString(), lang);

  // Check required variables.
  //if (!modelId ||  !channelId || !threadTs) {
  //  logger.error(`Not found any environment variables. Please check.`, {environemnts: {modelId, channelId, threadTs}});
    /*
    if (channelId && threadTs) {
      messageClient.sendMessage(
        lang && lang === "ja"
          ? "エラーが発生しました: 環境変数が設定されていない、または渡されていない可能性があります。"
          : "Error: Not found any environment variables.",
        channelId, 
        threadTs
      );
    }
    */
   /*
    return {
      status: 400, 
      body: "Missing environment variables"
    };
  */
  

  try {
    // Process to retrieve files from Azure Storage Blob
    const storageAccountName : string = process.env["STORAGE_ACCOUNT_NAME"] ?? "";
    const containerName : string = process.env["ROW_CONTAINER_NAME"] ?? "";
    const azureStrageConnectionString : string = process.env["AZURE_STORAGE_CONNECTION_STRING"] ?? "";
    const azureStorageBlobClient = new AzureStorageBlobClient(logger, azureStrageConnectionString, storageAccountName, containerName);
    const blobDataRecord: Record<string, string> = await azureStorageBlobClient.loadAllBlobs();
    const blobData: string = Object.values(blobDataRecord).join("\n");
    logger.info("retrieve files", {"blobData": blobData });

    // generate a prompt
    const lang: string = "ja";
    const architectureDescription: string = "test";
    const prompt = new Prompt(lang, architectureDescription).createLogAnalysisPrompt();
    logger.info("Made prompt", {prompt: prompt});
    
    // generate a response using the LLM
    const azureOpenAIEndpoint: string = process.env["AZURE_OPENAI_ENDPOINT"] ?? "";
    const azureOpenAIKey: string = process.env["AZURE_OPENAI_KEY"] ?? "";
    const azureOpenAIClient = new AzureOpenAIClient(azureOpenAIEndpoint, azureOpenAIKey);
    const summary = await azureOpenAIClient.summarize(prompt, blobData, 1000, 200);
    logger.info("generate answer", {summary: summary});
    
    if(!summary) throw new Error("No response from LLM");

    // We assume that threshold is 3,500. And it's not accurate. Please modify this value when you met error. 
    //if(answer.length < 3500){
      // Send the answer to Slack directly.
      /*
      await messageClient.sendMessage(
        messageClient.createMessageBlock(answer),
        channelId,
        threadTs
      );
      */
     //logger.info(answer);
    //}else{
      // Send the snippet of answer instead of message due to limitation of message size.
      //await messageClient.sendMarkdownSnippet("answer.md", answer, channelId, threadTs)
    //}

    //logger.info('Success to get answer:', answer);


    /* ****** */

  } catch (error) {
    logger.error("Something happened", error as Error);
    // Send the form to retry when error was occured.
    /*
    if(channelId && threadTs){
      await messageClient.sendMessage(
        messageClient.createErrorMessageBlock(),
        channelId, 
        threadTs
      );
      await messageClient.sendMessage( 
        messageClient.createMessageBlock(
          lang === "ja" 
            ? "リトライしたい場合は、以下のフォームからもう一度同じ内容のリクエストを送ってください。" 
            : "If you want to retry it, you send same request again from below form."
        ),
        channelId, 
        threadTs
      );
      const now = toZonedTime(new Date(), "Asia/Tokyo");
      await messageClient.sendMessage(
        messageClient.createFormBlock(format(now, "yyyy-MM-dd"), format(now, "HH:mm")),
        channelId,
        threadTs
      )
    }
    */
  }
  return {
    status: 400,
    body: "Processed"
  };
};

app.http('httpTrigger', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: httpTrigger
});
