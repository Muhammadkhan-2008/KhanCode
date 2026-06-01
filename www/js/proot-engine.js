import { Capacitor, registerPlugin } from '@capacitor/core';

// Reference the custom Capacitor plugin we registered in Android
const AeroPRoot = registerPlugin('AeroPRoot');

export class PRootEngine {
    constructor() {
        this.isInitialized = false;
        this.busy = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.log("Connecting to Native Kotlin Engine via Capacitor...");
        
        try {
            if (Capacitor.isNativePlatform()) {
                const response = await AeroPRoot.initialize();
                this.log("✓ " + response.message);
            } else {
                this.log("Running in Web Mode: Native Kotlin Plugin missing, falling back to Web Mock Engine.");
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.isInitialized = true;
        } catch (e) {
            this.log("✖ Initialization Error: " + e.message);
        }
    }

    async runCode(language, code) {
        if (!this.isInitialized) await this.initialize();
        if (this.busy) {
            this.log("Error: Engine is busy executing another task.");
            return;
        }

        this.busy = true;
        this.log(`> Executing ${language}...`);

        try {
            if (Capacitor.isNativePlatform()) {
                const response = await AeroPRoot.executeCode({ language, code });
                this.log(response.output);
                this.busy = false;
                return response.output;
            } else {
                // Mock execution response for Browser/Web context
                await new Promise(resolve => setTimeout(resolve, 1000));
                let output = "";
                if (language === 'python') {
                    output = "Python Mock Output:\nHello from Web Fallback!\nExecution successful.";
                } else if (language === 'cpp') {
                    output = "C++ Mock Compiler Output:\nCompiled successfully.\nHello from Web Fallback!";
                } else if (language === 'java') {
                    output = "Java Mock Output:\nHello from Web JVM Mock!";
                } else {
                    output = `Execution for ${language} is not configured yet.`;
                }
                this.log(output);
                this.busy = false;
                return output;
            }
        } catch (e) {
            this.log(`Execution Error: ${e.message}`);
            this.busy = false;
        }
    }

    log(msg) {
        const terminal = document.getElementById('terminal-container');
        if (terminal) {
            const div = document.createElement('div');
            div.textContent = msg;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
        }
        console.log("[PRoot Engine] " + msg);
    }
}
