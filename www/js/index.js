import * as monaco from 'monaco-editor';
import { AICopilot } from "./ai-copilot.js";
import { PRootEngine } from "./proot-engine.js";

document.addEventListener('deviceready', onDeviceReady, false);

let editor;
let activeFile = 'index.html';
const fileData = {
    'index.html': { language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>AeroCode</title>\n</head>\n<body>\n    <h1>Hello from AeroCode!</h1>\n</body>\n</html>' },
    'style.css': { language: 'css', content: 'body {\n    background-color: #f0f0f0;\n    color: #333;\n    text-align: center;\n    font-family: sans-serif;\n}' },
    'script.js': { language: 'javascript', content: 'console.log("Welcome to AeroCode Engine");' },
    'main.py': { language: 'python', content: 'print("Hello from Python in PRoot!")' },
    'app.cpp': { language: 'cpp', content: '#include <iostream>\n\nint main() {\n    std::cout << "Hello C++ Natively!" << std::endl;\n    return 0;\n}' }
};

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    initEditor();
    setupEventListeners();
    setupShortcuts();
}

function initEditor() {
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: fileData[activeFile].content,
        language: fileData[activeFile].language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });
}

function switchFile(filename) {
    if(!fileData[filename]) return;
    
    // Save current state
    if (editor) {
        fileData[activeFile].content = editor.getValue();
    }
    
    activeFile = filename;
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('browser-preview').style.display = 'none';
    document.getElementById('editor-container').style.display = 'block';

    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, fileData[filename].language);
    editor.setValue(fileData[filename].content);

    // Update UI highlights
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.file-item[data-file="${filename}"]`);
    if(activeEl) activeEl.classList.add('active');
}

function setupEventListeners() {
    document.getElementById('run-btn').addEventListener('click', runCode);
    document.getElementById('ai-btn').addEventListener('click', askAI);
    
    // File Explorer Clicks
    document.getElementById('file-explorer').addEventListener('click', (e) => {
        const item = e.target.closest('.file-item');
        if (item) {
            switchFile(item.getAttribute('data-file'));
        }
    });

    // Modals
    document.getElementById('new-file-btn').addEventListener('click', () => {
        document.getElementById('new-file-modal').style.display = 'flex';
    });
    
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'flex';
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    document.getElementById('create-file-submit').addEventListener('click', () => {
        const name = document.getElementById('new-file-name').value.trim();
        if (name && !fileData[name]) {
            let lang = 'plaintext';
            if (name.endsWith('.js')) lang = 'javascript';
            if (name.endsWith('.html')) lang = 'html';
            if (name.endsWith('.css')) lang = 'css';
            if (name.endsWith('.py')) lang = 'python';
            if (name.endsWith('.cpp')) lang = 'cpp';
            
            fileData[name] = { language: lang, content: '' };
            
            const div = document.createElement('div');
            div.className = 'file-item';
            div.setAttribute('data-file', name);
            div.textContent = `📄 ${name}`;
            document.getElementById('file-explorer').appendChild(div);
            
            switchFile(name);
            document.getElementById('new-file-modal').style.display = 'none';
        }
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const token = document.getElementById('hf-token-input').value.trim();
        if (token && window.aiCopilot) {
            window.aiCopilot.setToken(token);
        }
        document.getElementById('settings-modal').style.display = 'none';
    });

    // Search Mock
    document.getElementById('search-btn').addEventListener('click', () => {
        const query = prompt("Global Search Query:");
        if (query) logToTerminal(`Search for '${query}' yielded 0 results in current memory.`);
    });
}

function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            logToTerminal(`File '${activeFile}' saved successfully.`);
        }
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            document.getElementById('search-btn').click();
        }
        if (e.ctrlKey && e.key === ' ') {
            e.preventDefault();
            askAI();
        }
    });
}

async function runCode() {
    const code = editor.getValue();
    const language = fileData[activeFile].language;
    
    const terminal = document.getElementById('terminal-container');
    const browser = document.getElementById('browser-preview');
    const iframe = document.getElementById('preview-frame');
    const editorContainer = document.getElementById('editor-container');
    
    if (language === 'html') {
        editorContainer.style.display = 'none';
        browser.style.display = 'block';
        iframe.srcdoc = code;
        logToTerminal("Rendered HTML preview.");
    } else {
        if (!window.pRoot) window.pRoot = new PRootEngine();
        const res = await window.pRoot.runCode(language, code);
    }
}

async function askAI() {
    if (!window.aiCopilot) window.aiCopilot = new AICopilot();
    const promptText = window.prompt("Ask AI Copilot to write/edit code:");
    if (!promptText) return;

    const currentCode = editor.getValue();
    const generatedCode = await window.aiCopilot.generateCode(promptText, currentCode);
    
    if (generatedCode) {
        const position = editor.getPosition();
        editor.executeEdits("ai-copilot", [
            {
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: generatedCode,
                forceMoveMarkers: true
            }
        ]);
        window.aiCopilot.log("Code generated and inserted successfully.");
    }
}

function logToTerminal(msg) {
    const terminal = document.getElementById('terminal-container');
    if (terminal) {
        const div = document.createElement('div');
        div.textContent = msg;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    }
}

// Fallback for non-cordova environments
if (!window.cordova) {
    onDeviceReady();
}
