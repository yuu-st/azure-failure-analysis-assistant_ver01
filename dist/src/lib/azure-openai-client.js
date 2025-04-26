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
exports.AzureOpenAIClient = void 0;
const openai_1 = require("@langchain/openai");
const text_splitter_1 = require("langchain/text_splitter");
const document_1 = require("langchain/document");
const chains_1 = require("langchain/chains");
class AzureOpenAIClient {
    constructor(azureOpenAIEndpoint, azureOpenAIkey, model = "gpt-3.5-turbo", temperature = 0.7, maxTokens = 1000) {
        this.model = new openai_1.ChatOpenAI({
            apiKey: azureOpenAIkey,
            model: model,
            temperature: temperature,
            maxTokens: maxTokens,
            configuration: {
                baseURL: azureOpenAIEndpoint
            }
        });
    }
    extractInstanceName(endpoint) {
        return endpoint.split("//")[1].split(".")[0];
    }
    summarize(prompt, data, chunkSize = 1000, chunkOverlap = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            // Split the input data
            const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: chunkSize,
                chunkOverlap: chunkOverlap,
            });
            const documents = yield splitter.createDocuments([data]);
            const documentsWithPrompt = documents.map(doc => new document_1.Document({
                pageContent: `${prompt}\n<log>\n${doc.pageContent}\n<log>`,
            }));
            const chain = yield (0, chains_1.loadSummarizationChain)(this.model, {
                type: "map_reduce",
            });
            const result = yield chain.invoke(documentsWithPrompt);
            const summary = result.summary;
            return summary;
        });
    }
}
exports.AzureOpenAIClient = AzureOpenAIClient;
//# sourceMappingURL=azure-openai-client.js.map