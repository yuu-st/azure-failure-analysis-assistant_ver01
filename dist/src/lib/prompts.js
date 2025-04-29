"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = void 0;
class Prompt {
    constructor(language = "en", architectureDescription) {
        this.language = language;
        this.architectureDescription = architectureDescription;
    }
    createBlobMapPrompt() {
        let prompt = "";
        if (this.language === "ja") {
            const prompt = `
      あなたは優秀なシステムエンジニアです。
      以下のログを確認し、エラーまたは異常な動作の兆候が含まれているか判断してください。
      異常がある場合は、それが何であるかを明確に書いてください。

      以下のログ:
      {input}
      `;
            return prompt;
        }
    }
    createBlobReducePrompt() {
        let prompt = "";
        if (this.language === "ja") {
            const prompt = `
      以下はシステムログの要約です。
      これらの内容を元に、全体を通して障害の根本原因を推測してください。
      また、どのログから推測したのかを明記してください。
      ログにエラーが見当たらない場合は、「異常なし」とだけ出力してください。

      要約されたログ:
      {input}
      `;
            return prompt;
        }
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompts.js.map