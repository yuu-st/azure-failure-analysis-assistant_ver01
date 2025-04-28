import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document";

export class AzureOpenAIClient {
  private llm: ChatOpenAI;

  constructor(azureOpenAIEndpoint: string, azureOpenAIApikey: string, deploymentName: string = "gpt-35-turbo-16k", azureOpenAIApiVersion: string = "2024-12-01-preview", temperature: number = 0.7, maxTokens: number = 1000) {   
    this.llm = new ChatOpenAI({
      azureOpenAIApiDeploymentName: deploymentName,
      azureOpenAIApiVersion: azureOpenAIApiVersion,
      temperature: temperature,
      maxTokens: maxTokens,
    });
  }

  public async analyze(prompt: string, data: string, chunkSize: number = 1000, chunkOverlap: number = 200): Promise<string> {
    
    const mapPrompt = PromptTemplate.fromTemplate(prompt);
    //const reducePrompt = PromptTemplate.fromTemplate("これらの要約をさらにまとめてください:\n\n{doc}");

    const recursiveChain = await loadSummarizationChain(this.llm, {
      type: "map_reduce",
      combineMapPrompt: mapPrompt,
      //combinePrompt:reducePrompt,
      verbose: true,
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });
    const docs: Document[] = await splitter.createDocuments([data]);

    const result = await recursiveChain.invoke({ 
      input_documents: docs
    } );
    const summary = result.summary;

    return summary;
  }
}