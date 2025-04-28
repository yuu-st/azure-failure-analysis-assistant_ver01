import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document";

export class AzureOpenAIClient {
  private llm: ChatOpenAI;

  constructor(azureOpenAIEndpoint: string, azureOpenAIkey: string, model: string = "gpt-3.5-turbo", temperature: number = 0.7, maxTokens: number = 1000) {   
    this.llm = new ChatOpenAI({
      apiKey: azureOpenAIkey,
      model: model,
      temperature: temperature,
      maxTokens: maxTokens,
      configuration: { 
        baseURL: azureOpenAIEndpoint 
      }
    });
  }

  public async analyze(prompt: string, data: string, chunkSize: number = 1000, chunkOverlap: number = 200): Promise<string> {
    
    const mapPrompt = PromptTemplate.fromTemplate(prompt);
    const reducePrompt = PromptTemplate.fromTemplate("これらの要約をさらにまとめてください:\n\n{doc}");

    const recursiveChain = await loadSummarizationChain(this.llm, {
      type: "map_reduce",
      combineMapPrompt: mapPrompt,
      combinePrompt:reducePrompt,
      verbose: true,
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });
    const docs: Document[] = await splitter.createDocuments([data]);

    const result = await recursiveChain.invoke({ 
      input_documents: docs,
      doc: "{doc}",
    } );
    const summary = result.summary;

    return summary;
  }
}