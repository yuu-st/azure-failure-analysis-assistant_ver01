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
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpTrigger = void 0;
const functions_1 = require("@azure/functions");
const prompts_js_1 = require("../../lib/prompts.js");
const logger_js_1 = require("../../lib/logger.js");
const azure_storage_blob_client_js_1 = require("../../lib/azure-storage-blob-client.js");
const azure_openai_client_js_1 = require("../../lib/azure-openai-client.js");
function httpTrigger(req, context) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new logger_js_1.Logger(context, "AzureFailureAnalysisAssistant");
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
            const storageAccountName = (_a = process.env["STORAGE_ACCOUNT_NAME"]) !== null && _a !== void 0 ? _a : "";
            const containerName = (_b = process.env["ROW_CONTAINER_NAME"]) !== null && _b !== void 0 ? _b : "";
            const azureStrageConnectionString = (_c = process.env["AZURE_STORAGE_CONNECTION_STRING"]) !== null && _c !== void 0 ? _c : "";
            const azureStorageBlobClient = new azure_storage_blob_client_js_1.AzureStorageBlobClient(logger, azureStrageConnectionString, storageAccountName, containerName);
            const blobDataRecord = yield azureStorageBlobClient.loadAllBlobs();
            const blobData = Object.values(blobDataRecord).join("\n");
            logger.info("retrieve files", { "blobData": blobData });
            // generate a prompt
            const lang = "ja";
            const architectureDescription = "test";
            const prompt = new prompts_js_1.Prompt(lang, architectureDescription);
            const blobMapPrompt = prompt.createBlobMapPrompt();
            const blobReducePrompt = prompt.createBlobMapPrompt();
            logger.info("Made prompt", { blobMapPrompt: blobMapPrompt, blobReducePrompt: blobReducePrompt });
            // analyze logs using the LLM
            const azureOpenAIClient = new azure_openai_client_js_1.AzureOpenAIClient();
            const summary = yield azureOpenAIClient.analyze(blobMapPrompt, blobReducePrompt, blobData, 2500, 250);
            logger.info("results", { summary: summary });
            if (!summary)
                throw new Error("No response from LLM");
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
        }
        catch (error) {
            logger.error("Something happened", error);
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
    });
}
exports.httpTrigger = httpTrigger;
;
functions_1.app.http('httpTrigger', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: httpTrigger
});
//# sourceMappingURL=main.js.map