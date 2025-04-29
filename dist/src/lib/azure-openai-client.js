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
const prompts_1 = require("@langchain/core/prompts");
const text_splitter_1 = require("langchain/text_splitter");
const chains_1 = require("langchain/chains");
class AzureOpenAIClient {
    constructor(azureOpenAIEndpoint, azureOpenAIApikey, deploymentName = "gpt-35-turbo-16k", azureOpenAIApiVersion = "2024-12-01-preview", temperature = 0.7, maxTokens = 1000) {
        this.llm = new openai_1.ChatOpenAI({
            azureOpenAIApiDeploymentName: deploymentName,
            azureOpenAIApiVersion: azureOpenAIApiVersion,
            temperature: temperature,
            maxTokens: maxTokens,
        });
    }
    analyze(prompt, data, chunkSize = 1000, chunkOverlap = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            const mapPrompt = prompts_1.PromptTemplate.fromTemplate(prompt);
            const reducePrompt = prompts_1.PromptTemplate.fromTemplate("これらの要約をさらにまとめてください:\n\n{doc}");
            const recursiveChain = yield (0, chains_1.loadSummarizationChain)(this.llm, {
                type: "map_reduce",
                combineMapPrompt: mapPrompt,
                combinePrompt: reducePrompt,
                //verbose: true,
            });
            const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: chunkSize,
                chunkOverlap: chunkOverlap,
            });
            const docs = yield splitter.createDocuments([data]);
            const result = yield recursiveChain.invoke({
                input_documents: docs,
                doc: docs.map(doc => doc.pageContent).join("\n")
            });
            const text = result.text;
            return text;
        });
    }
}
exports.AzureOpenAIClient = AzureOpenAIClient;
//# sourceMappingURL=azure-openai-client.js.map