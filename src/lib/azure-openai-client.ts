import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { loadSummarizationChain } from "langchain/chains";

export class AzureOpenAIClient {
  private model: ChatOpenAI;

  constructor(azureOpenAIEndpoint: string, azureOpenAIkey: string, model: string = "gpt-3.5-turbo", temperature: number = 0.7, maxTokens: number = 1000) {   
    this.model = new ChatOpenAI({
      apiKey: azureOpenAIkey,
      model: model,
      temperature: temperature,
      maxTokens: maxTokens,
      configuration: { 
        baseURL: azureOpenAIEndpoint 
      }
    });
  }

  public async summarize(prompt: string, data: string, chunkSize: number = 1000, chunkOverlap: number = 200): Promise<string> {
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });

    const documents: Document[] = await splitter.createDocuments([data]);

    const documentsWithPrompt = documents.map(doc => new Document({
      pageContent: `${prompt}\n<log>\n${doc.pageContent}\n<log>`,
    }));

    const chain = await loadSummarizationChain(this.model, {
      type: "map_reduce",
    });

    const result = await chain.invoke({
      input_documents: documentsWithPrompt
    });
    const summary = result.summary;

    return summary;
  }
}