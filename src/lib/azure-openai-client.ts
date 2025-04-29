import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MapReduceDocumentsChain } from "langchain/chains";
import { LLMChain } from "langchain/chains";
import { Document } from "langchain/document";
import { StuffDocumentsChain } from "langchain/chains";

export class AzureOpenAIClient {
  private llm: ChatOpenAI;

  constructor(deploymentName: string = "gpt-35-turbo-16k", azureOpenAIApiVersion: string = "2024-12-01-preview", temperature: number = 0.7, maxTokens: number = 1000) {   
    this.llm = new ChatOpenAI({
      azureOpenAIApiDeploymentName: deploymentName,
      azureOpenAIApiVersion: azureOpenAIApiVersion,
      temperature: temperature,
      maxTokens: maxTokens,
    });
  }

  public async analyze(mapPrompt: string, reducePrompt: string, data: string, chunkSize: number = 2000, chunkOverlap: number = 200): Promise<string> {
    
    const mapPromptTemplate = PromptTemplate.fromTemplate(mapPrompt);
    const reducePromptTemplate = PromptTemplate.fromTemplate(reducePrompt);

    const mapChain = new LLMChain({
      llm: this.llm,
      prompt: mapPromptTemplate,
    });

    const reduceChain = new LLMChain({
      llm: this.llm,
      prompt: reducePromptTemplate,
    });

    const stuffChain = new StuffDocumentsChain({
      llmChain: reduceChain,
      documentVariableName: "input",
    });

    const mapReduceChain = new MapReduceDocumentsChain({
      llmChain: mapChain,
      combineDocumentChain: stuffChain,
      returnIntermediateSteps: false,
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });
    const docs: Document[] = await splitter.createDocuments([data]);

    const result = await mapReduceChain.invoke({ 
      input_documents: docs
    });
    const text = result.text;

    return text;
  }
}