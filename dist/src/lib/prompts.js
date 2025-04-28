"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = void 0;
class Prompt {
    constructor(language = "en", architectureDescription) {
        this.language = language;
        this.architectureDescription = architectureDescription;
    }
    createLogAnalysisPrompt() {
        let prompt = "";
        if (this.language === "ja") {
            prompt =
                `あなたは優秀なシステムエンジニアでシステムの運用保守をしています。
      現在、運用管理者から障害が発生したとの連絡がありました。
      あなたは、以下のログを確認し、発生した事象の根本原因を推測してください。
      根本原因を記述する際に、参考にしたログを記載し、運用管理者が実際のログを確認しやすくしてください。
      必ず日本語で回答してください。：\n\n{doc}`;
        }
        return prompt;
    }
    ;
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompts.js.map