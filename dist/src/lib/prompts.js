"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = void 0;
class Prompt {
    constructor(language = "ja", architectureDescription) {
        this.language = language;
        this.architectureDescription = architectureDescription;
    }
    createBlobMapPrompt() {
        if (this.language === "ja") {
            const prompt = `
      あなたは優秀なシステムエンジニアとして、運用業務を行っています。
      以下のログを確認し、エラー（ERROR）や異常な動作の兆候を含むログを抽出してください。

      以下はログ:
      {input}
      `;
            return prompt;
        }
    }
    createBlobReducePrompt() {
        if (this.language === "ja") {
            const prompt = `
      あなたは優秀なシステムエンジニアであり、システムの運用業務を担当しています。
      以下は、本障害の原因に関連する可能性が高いシステムログです。
      これらのログをもとに、障害の根本原因を日本語で推測してください。
      また、根本原因の推測に使用した具体的なログを示してください。
      もし、ログにエラーが見当たらない場合は、「異常なし」とだけ記入してください。

      以下はログ:
      {input}
      `;
            return prompt;
        }
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompts.js.map