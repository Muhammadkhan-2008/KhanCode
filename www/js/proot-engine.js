// Alpine/PRoot integration engine for AeroCode
// Bridges JavaScript with our custom Native Kotlin PRoot Cordova Plugin

export class PRootEngine {
    constructor() {
        this.isInitialized = false;
        this.busy = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.log("Connecting to Native Kotlin Engine...");
        
        return new Promise((resolve, reject) => {
            if (window.AeroPRoot) {
                window.AeroPRoot.initialize(
                    (msg) => {
                        this.log("✓ " + msg);
                        this.isInitialized = true;
                        resolve();
                    },
                    (err) => {
                        this.log("✖ Initialization Error: " + err);
                        reject(err);
                    }
                );
            } else {
                this.log("Native Kotlin Plugin missing, falling back to Web Mock Engine.");
                setTimeout(() => {
                    this.isInitialized = true;
                    resolve();
                }, 1000);
            }
        });
    }

    async runCode(language, code) {
        if (!this.isInitialized) await this.initialize();
        if (this.busy) {
            this.log("Error: Engine is busy executing another task.");
            return;
        }

        this.busy = true;
        this.log(`> Executing ${language}...`);

        return new Promise((resolve) => {
            if (window.AeroPRoot) {
                window.AeroPRoot.executeCode(language, code, 
                    (output) => {
                        this.log(output);
                        this.busy = false;
                        resolve(output);
                    },
                    (err) => {
                        this.log(`Execution Error: ${err}`);
                        this.busy = false;
                        resolve(err);
                    }
                );
            } else {
                // Mock execution response for Browser/Web context
                setTimeout(() => {
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
                    resolve(output);
                }, 1000);
            }
        });
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
