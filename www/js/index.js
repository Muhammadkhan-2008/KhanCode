import * as monaco from 'monaco-editor';

document.addEventListener('deviceready', onDeviceReady, false);

let editor;

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    initEditor();
    setupEventListeners();
}

function initEditor() {
    const defaultCode = `<!DOCTYPE html>
<html>
<head>
    <title>AeroCode Test</title>
    <style>
        body { font-family: sans-serif; text-align: center; margin-top: 50px; }
        h1 { color: #007acc; }
    </style>
</head>
<body>
    <h1>Hello from AeroCode!</h1>
    <p>HTML/CSS/JS execution engine.</p>
</body>
</html>`;

    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: defaultCode,
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true
    });
}

function setupEventListeners() {
    document.getElementById('run-btn').addEventListener('click', runCode);
}

function runCode() {
    const code = editor.getValue();
    const language = editor.getModel().getLanguageId();
    
    const terminal = document.getElementById('terminal-container');
    const browser = document.getElementById('browser-preview');
    const iframe = document.getElementById('preview-frame');
    const editorContainer = document.getElementById('editor-container');
    
    if (language === 'html') {
        terminal.style.display = 'none';
        editorContainer.style.display = 'none';
        browser.style.display = 'block';
        
        iframe.srcdoc = code;
        
        // Add a back button if it doesn't exist
        if (!document.getElementById('back-btn')) {
            const backBtn = document.createElement('button');
            backBtn.id = 'back-btn';
            backBtn.className = 'btn';
            backBtn.textContent = 'Back to Editor';
            backBtn.onclick = () => {
                browser.style.display = 'none';
                editorContainer.style.display = 'block';
                terminal.style.display = 'block';
                backBtn.remove();
            };
            document.querySelector('.controls').prepend(backBtn);
        }
    } else {
        // Here we'll implement Alpine/PRoot execution later
        terminal.innerHTML += `<div>> Running ${language} via PRoot (Not yet implemented)</div>`;
        terminal.scrollTop = terminal.scrollHeight;
    }
}
