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
const chains_2 = require("langchain/chains");
const chains_3 = require("langchain/chains");
class AzureOpenAIClient {
    constructor(deploymentName = "gpt-35-turbo-16k", azureOpenAIApiVersion = "2024-12-01-preview", temperature = 0.7, maxTokens = 1000) {
        this.llm = new openai_1.ChatOpenAI({
            azureOpenAIApiDeploymentName: deploymentName,
            azureOpenAIApiVersion: azureOpenAIApiVersion,
            temperature: temperature,
            maxTokens: maxTokens,
        });
    }
    analyze(mapPrompt, reducePrompt, data, chunkSize = 2000, chunkOverlap = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            const mapPromptTemplate = prompts_1.PromptTemplate.fromTemplate(mapPrompt);
            const reducePromptTemplate = prompts_1.PromptTemplate.fromTemplate(reducePrompt);
            const mapChain = new chains_2.LLMChain({
                llm: this.llm,
                prompt: mapPromptTemplate,
            });
            const reduceChain = new chains_2.LLMChain({
                llm: this.llm,
                prompt: reducePromptTemplate,
            });
            const stuffChain = new chains_3.StuffDocumentsChain({
                llmChain: reduceChain,
                documentVariableName: "input",
            });
            const mapReduceChain = new chains_1.MapReduceDocumentsChain({
                llmChain: mapChain,
                combineDocumentChain: stuffChain,
                returnIntermediateSteps: false,
            });
            const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: chunkSize,
                chunkOverlap: chunkOverlap,
            });
            const docs = yield splitter.createDocuments([data]);
            const result = yield mapReduceChain.invoke({
                input_documents: docs
            });
            const text = result.text;
            return text;
        });
    }
}
exports.AzureOpenAIClient = AzureOpenAIClient;
//# sourceMappingURL=azure-openai-client.js.map