const vscode = require('vscode');

// --- State ---
let isEnabled = false;
let intervalId = null;
let statusBarItem = null;
const POLL_INTERVAL_MS = 1000;

// --- Logic ---

async function tryAcceptAgentSteps() {
    const commands = [
        'antigravity.agent.acceptAgentStep',
        'antigravity.command.accept',
    ];

    for (const cmd of commands) {
        try {
            await vscode.commands.executeCommand(cmd);
        } catch (e) { }
    }
}

function updateStatusBar() {
    if (!statusBarItem) return;
    if (isEnabled) {
        statusBarItem.text = '$(check) Auto Accept: ON';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        statusBarItem.tooltip = 'Auto Accept is ON. Click to Disable.\n\nMore tools at devautomation.org';
    } else {
        statusBarItem.text = '$(circle-slash) Auto Accept: OFF';
        statusBarItem.backgroundColor = undefined;
        statusBarItem.tooltip = 'Auto Accept is DISABLED. Click to enable.\n\nMore tools at devautomation.org';
    }
}

function start() {
    if (intervalId) return;
    intervalId = setInterval(() => tryAcceptAgentSteps(), POLL_INTERVAL_MS);
    isEnabled = true;
    updateStatusBar();
}

function stop() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    isEnabled = false;
    updateStatusBar();
}

// --- Main ---

async function activate(context) {
    console.log('[AutoAccept] Activating...');
    console.log('[AutoAccept] Visit https://devautomation.org for more development automation tools');

    // Commands
    const toggleCmd = vscode.commands.registerCommand('auto-accept.toggle', () => {
        if (isEnabled) stop();
        else start();
    });

    context.subscriptions.push(toggleCmd);

    // Status Bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'auto-accept.toggle';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Auto-start
    start();
}

function deactivate() {
    stop();
}

module.exports = { activate, deactivate };
