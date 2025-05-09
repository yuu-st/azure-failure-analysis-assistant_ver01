import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { StuffDocumentsChain } from "langchain/chains";
import { Logger } from "./logger.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export class AzureOpenAIClient {
  private llm: ChatOpenAI;
  private logger: Logger;

  constructor(deploymentName: string = "gpt-35-turbo-16k", azureOpenAIApiVersion: string = "2024-12-01-preview", temperature: number = 0.7, maxTokens: number = 3000, logger: Logger) {
    this.llm = new ChatOpenAI({
      azureOpenAIApiDeploymentName: deploymentName,
      azureOpenAIApiVersion: azureOpenAIApiVersion,
      temperature: temperature,
      maxTokens: maxTokens,
    });

    this.logger = logger;
  }

  public async analyze(mapPrompt: string, reducePrompt: string, data: string, chunkSize: number = 2000, chunkOverlap: number = 100): Promise<string> {

    try {
      this.logger.info("check1");
      const mappedDocuments = await this.mapProcess(mapPrompt, data, chunkSize, chunkOverlap);
      this.logger.info("check2");
      this.logger.info("mappedDocuments", { "mappedDocuments": mappedDocuments });
      const finalResult = await this.reduceProcess(reducePrompt, mappedDocuments);
      this.logger.info("check3");


      return finalResult;
    } catch (err) {
      throw err;
    }
  }

  public async mapProcess(mapPrompt: string, data: string, chunkSize: number = 2000, chunkOverlap: number = 200): Promise<Document[]> {
    try {
      const mapPromptTemplate = ChatPromptTemplate.fromTemplate(mapPrompt);

      const mapChain = mapPromptTemplate.pipe(this.llm);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      });

      const docs: Document[] = await splitter.createDocuments([data]);

      const mappedResults = await Promise.all(docs.map(async (doc) => {
        const response = await mapChain.invoke({ input: doc.pageContent });
        return new Document({ pageContent: response.text });
      }));

      this.logger.info("mappedResults", { "mappedResults": mappedResults });

      return mappedResults;
    } catch (err) {
      throw err;
    }
  }

  public async reduceProcess(reducePrompt: string, mappedDocuments: Document[]): Promise<string> {

    try {
      const chatPromptTemplate = ChatPromptTemplate.fromTemplate(reducePrompt);

      const reduceChain = chatPromptTemplate.pipe(this.llm);

      const reduceResult = await reduceChain.invoke({
        input_documents: mappedDocuments
      });

      return reduceResult.text;
    } catch (err) {
      throw err;
    }
  }

}