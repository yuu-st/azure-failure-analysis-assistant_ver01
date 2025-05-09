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
const prompts_1 = require("@langchain/core/prompts");
class AzureOpenAIClient {
    constructor(deploymentName = "gpt-35-turbo-16k", azureOpenAIApiVersion = "2024-12-01-preview", temperature = 0.7, maxTokens = 4096, logger) {
        this.llm = new openai_1.ChatOpenAI({
            azureOpenAIApiDeploymentName: deploymentName,
            azureOpenAIApiVersion: azureOpenAIApiVersion,
            temperature: temperature,
            maxTokens: maxTokens,
        });
        this.logger = logger;
    }
    analyze(mapPrompt, reducePrompt, data, chunkSize = 2000, chunkOverlap = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info("check1");
                const mappedDocuments = yield this.mapProcess(mapPrompt, data, chunkSize, chunkOverlap);
                this.logger.info("check2");
                this.logger.info("mappedDocuments", { "mappedDocuments": mappedDocuments });
                const finalResult = yield this.reduceProcess(reducePrompt, mappedDocuments);
                this.logger.info("check3");
                return finalResult;
            }
            catch (err) {
                throw err;
            }
        });
    }
    mapProcess(mapPrompt, data, chunkSize = 2000, chunkOverlap = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mapPromptTemplate = prompts_1.ChatPromptTemplate.fromTemplate(mapPrompt);
                const mapChain = mapPromptTemplate.pipe(this.llm);
                const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                    chunkSize: chunkSize,
                    chunkOverlap: chunkOverlap,
                });
                const docs = yield splitter.createDocuments([data]);
                const mappedResults = yield Promise.all(docs.map((doc) => __awaiter(this, void 0, void 0, function* () {
                    const response = yield mapChain.invoke({ input: doc.pageContent });
                    return new document_1.Document({ pageContent: response.text });
                })));
                this.logger.info("mappedResults", { "mappedResults": mappedResults });
                return mappedResults;
            }
            catch (err) {
                throw err;
            }
        });
    }
    reduceProcess(reducePrompt, mappedDocuments) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatPromptTemplate = prompts_1.ChatPromptTemplate.fromTemplate(reducePrompt);
                const reduceChain = chatPromptTemplate.pipe(this.llm);
                const reduceResult = yield reduceChain.invoke({
                    input_documents: mappedDocuments
                });
                return reduceResult.text;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.AzureOpenAIClient = AzureOpenAIClient;
//# sourceMappingURL=azure-openai-client.js.map