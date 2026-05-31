// AI Copilot Agent for AeroCode
// Leverages free HuggingFace endpoints to generate code intelligently.

export class AICopilot {
    constructor() {
        // We can use a free Hugging Face API URL or another open API.
        // For production, the user would enter their own free token.
        this.apiEndpoint = "https://api-inference.huggingface.co/models/bigcode/starcoder";
        this.token = ""; // Placeholder for user HF token
    }

    setToken(token) {
        this.token = token;
    }

    async generateCode(prompt, contextCode) {
        this.log("AI Agent is thinking...");
        
        if (!this.token) {
            this.log("AI Warning: No API token set. Using fallback mock response for demo.");
            await new Promise(resolve => setTimeout(resolve, 1500));
            return `// AI Generated code based on: ${prompt}\nconsole.log("Hello from AI Copilot!");`;
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: `${contextCode}\n// Task: ${prompt}\n`,
                    parameters: { max_new_tokens: 150, temperature: 0.2 }
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const result = await response.json();
            return result[0].generated_text.replace(`${contextCode}\n// Task: ${prompt}\n`, "");
        } catch (error) {
            this.log(`AI Error: ${error.message}`);
            return null;
        }
    }

    log(msg) {
        const terminal = document.getElementById('terminal-container');
        if (terminal) {
            const div = document.createElement('div');
            div.style.color = '#aa55ff'; // Purple color for AI output
            div.textContent = msg;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
        }
        console.log("[AI Copilot] " + msg);
    }
}
