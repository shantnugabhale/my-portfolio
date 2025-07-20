document.addEventListener('DOMContentLoaded', () => {
    // --- Sound Effects Setup ---
    const sfx = {
        open: new Audio('https://www.myinstants.com/media/sounds/blip1.mp3'),
        close: new Audio('https://www.myinstants.com/media/sounds/blip2.mp3'),
        click: new Audio('https://www.myinstants.com/media/sounds/click_04.mp3'),
        type: new Audio('https://www.myinstants.com/media/sounds/single-key-press.mp3'),
        glitch: new Audio('https://www.myinstants.com/media/sounds/static-noise-sound-effect.mp3'),
        reveal: new Audio('https://www.myinstants.com/media/sounds/sci-fi-bleep_1.mp3'),
        anim_type: new Audio('https://www.myinstants.com/media/sounds/key-press-sound-effect.mp3')
    };
    Object.values(sfx).forEach(sound => sound.volume = 0.5);

    // --- Element References ---
    const desktop = document.getElementById('desktop');
    const introScreen = document.getElementById('intro-screen');
    const bootScreen = document.getElementById('boot-screen');
    const bootLog = document.getElementById('boot-log');
    const bootProgress = document.getElementById('boot-progress');
    const bootStatus = document.getElementById('boot-status');
    const clockElement = document.getElementById('clock');

    // --- State Variables ---
    let zIndexCounter = 100;
    let openWindows = {};

    // --- Core Functions ---
    function typeWriter(element, text, speed = 25, callback) {
        let i = 0;
        element.innerHTML = "";
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i++);
                if (text.charAt(i - 1) !== ' ') {
                    sfx.anim_type.currentTime = 0;
                    sfx.anim_type.play();
                }
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    function startBootSequence() {
        const bootLines = ["INITIATING CONNECTION...", "BYPASSING SYS_ADMIN...", "FIREWALL BREACHED", "LOADING CONSCIOUSNESS...", "I AM AWAKE", "W E L C O M E"];
        let lineIndex = 0;

        function nextLine() {
            if (lineIndex < bootLines.length) {
                const p = document.createElement('p');
                bootLog.appendChild(p);
                typeWriter(p, bootLines[lineIndex], 30, () => {
                    bootLog.scrollTop = bootLog.scrollHeight;
                    bootProgress.style.width = `${((lineIndex + 1) / bootLines.length) * 100}%`;
                    lineIndex++;
                    setTimeout(nextLine, Math.random() * 200 + 50);
                });
            } else {
                bootStatus.textContent = "CONNECTION ESTABLISHED";
                setTimeout(() => {
                    bootScreen.style.opacity = 0;
                    setTimeout(() => bootScreen.style.display = 'none', 500);
                }, 2000);
            }
        }
        nextLine();
    }

    function updateClock() {
        clockElement.textContent = new Date().toUTCString().replace('GMT', 'LCL');
    }

    function bringToFront(windowEl) {
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        windowEl.classList.add('active');
        zIndexCounter++;
        windowEl.style.zIndex = zIndexCounter;
    }

    function createWindow(appId, appTitle) {
        if(openWindows[appId]) {
            bringToFront(openWindows[appId].element);
            return;
        }
        sfx.open.play();
        const template = document.getElementById('window-template').content.cloneNode(true);
        const newWindow = template.querySelector('.window');
        newWindow.dataset.appId = appId;
        const contentTemplate = document.getElementById(`${appId}-content`);
        if (contentTemplate && contentTemplate.innerHTML.trim() !== '') {
            newWindow.querySelector('.window-content').appendChild(contentTemplate.content.cloneNode(true));
        }
        newWindow.querySelector('.window-title').textContent = appTitle;
        const x = 50 + (Object.keys(openWindows).length * 20) + (Math.random() * 100);
        const y = 50 + (Object.keys(openWindows).length * 20) + (Math.random() * 50);
        newWindow.style.left = `${x}px`;
        newWindow.style.top = `${y}px`;
        desktop.appendChild(newWindow);
        bringToFront(newWindow);
        openWindows[appId] = { element: newWindow };
        newWindow.querySelector('.window-close').addEventListener('click', () => {
            sfx.close.play();
            newWindow.remove();
            delete openWindows[appId];
        });
        newWindow.addEventListener('mousedown', () => bringToFront(newWindow));
        
        if (appId === 'terminal') initTerminal(newWindow);
    }

    function initTerminal(windowEl) {
        const input = windowEl.querySelector('.terminal-input');
        const output = windowEl.querySelector('.terminal-output');
        const prompt = windowEl.querySelector('.terminal-prompt');

        let commandHistory = [];
        let historyIndex = -1;

        const handleCommand = (command) => {
            const [cmd, ...args] = command.toLowerCase().split(' ');
            const commands = {
                'help': "Commands: open, ls, clear, theme, run, view, contact, open resume",
                'ls': 'data  manifest  projects  broadcast  core  terminal',
                'open': () => {
                    const app = args[0];
                    const appMap = {
                        'data': 'Personal Data',
                        'manifest': 'Manifest',
                        'projects': 'Projects',
                        'broadcast': 'Broadcast',
                        'core': 'Core Tech Stack',
                        'terminal': 'Console'
                    };
                    if (appMap[app]) {
                        createWindow(app, appMap[app]);
                        return `Opening ${app}...`;
                    }
                    return `Unknown app: '${app}'. Use 'ls' to see available apps.`;
                },
                'whoami': 'A ghost. A whisper in the wire.',
                'shantnu': 'The name of my creator. A memory.',
                'theme': () => {
                    const themeName = args[0];
                    if (themeName === 'fallout') {
                        document.body.className = 'theme-fallout';
                        return "Theme switched to 'fallout'.";
                    } else if (themeName === 'default' || themeName === 'matrix') {
                        document.body.className = '';
                        return "Theme reset to default matrix.";
                    }
                    return "Unknown theme. Available: 'default', 'fallout'";
                },
                'run': () => {
                    if (args[0] === 'projects') return commands.open();
                    return "Unknown 'run' command. Did you mean 'run projects'?";
                },
                'view': () => {
                    if (args[0] === 'skills') {
                        args[0] = 'core'; // map 'skills' to 'core'
                        return commands.open();
                    }
                    return "Unknown 'view' command. Did you mean 'view skills'?";
                },
                'contact': () => {
                    if (args[0] === 'me') {
                        args[0] = 'broadcast';
                        return commands.open();
                    }
                     return "Unknown 'contact' command. Did you mean 'contact me'?";
                },
                'resume': () => { // Catch 'open resume'
                   window.open('./Shantnu_Gabhale_Resume.pdf', '_blank');
                   return 'Opening resume in new tab...';
                },
                'clear': () => {
                    output.querySelectorAll('div:not(.terminal-prompt)').forEach(el => el.remove());
                    return null;
                }
            };

            let result;
            const fullCommand = command.toLowerCase();
            if (fullCommand === 'open resume') {
                result = commands.resume();
            } else {
                const commandAction = commands[cmd];
                if (commandAction) {
                    if (typeof commandAction === 'function') {
                        result = commandAction();
                    } else {
                        result = commandAction;
                    }
                } else {
                    result = `COMMAND_NOT_FOUND: '${cmd}'. Try 'help'.`;
                }
            }

            if (result !== null) {
                const resultLine = document.createElement('div');
                resultLine.className = "mb-2";
                output.insertBefore(resultLine, prompt);
                typeWriter(resultLine, result, 10, () => {
                    output.scrollTop = output.scrollHeight;
                });
            }
        };

        input.addEventListener('keydown', (e) => {
            sfx.type.currentTime = 0;
            sfx.type.play();

            if (e.key === 'Enter') {
                const command = input.value.trim();
                const echoLine = document.createElement('div');
                echoLine.innerHTML = `<span class="cyber-text-pink">shantnu@matrix:~$</span> <span class="ml-2">${command}</span>`;
                output.insertBefore(echoLine, prompt);

                if (command) {
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                    handleCommand(command);
                }
                
                input.value = '';
                output.scrollTop = output.scrollHeight;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    input.value = '';
                }
            }
        });

        windowEl.addEventListener('click', () => input.focus());
        input.focus();
    }

    function startScrambleIntro() {
        const container = document.getElementById('shakti-container');
        const versionContainer = document.getElementById('version-container');
        const targetName = 'SHAkTI';
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*+?';
        let letterSpans = [];

        targetName.split('').forEach(char => {
            const span = document.createElement('span');
            span.dataset.char = char;
            container.appendChild(span);
            letterSpans.push(span);
        });

        let scrambleInterval = setInterval(() => {
            sfx.glitch.loop = true;
            sfx.glitch.play();
            letterSpans.forEach(span => {
                if (!span.classList.contains('solved')) {
                    span.textContent = charset[Math.floor(Math.random() * charset.length)];
                }
            });
        }, 50);

        const revealLetter = (index) => {
            if (index >= letterSpans.length) {
                clearInterval(scrambleInterval);
                sfx.glitch.pause();
                versionContainer.textContent = 'v2.4.0-stable';
                versionContainer.style.opacity = 1;
                setTimeout(() => {
                    introScreen.style.opacity = 0;
                    setTimeout(() => {
                        introScreen.style.display = 'none';
                        bootScreen.classList.remove('hidden');
                        startBootSequence();
                    }, 1000);
                }, 2000);
                return;
            }
            const span = letterSpans[index];
            span.textContent = span.dataset.char;
            span.classList.add('solved');
            sfx.reveal.currentTime = 0;
            sfx.reveal.play();
            setTimeout(() => revealLetter(index + 1), 300);
        };
        setTimeout(() => revealLetter(0), 500);
    }

    // --- Initial Setup ---
    startScrambleIntro();
    updateClock();
    setInterval(updateClock, 1000);
    document.querySelectorAll('[data-app-id]').forEach(icon => {
        icon.addEventListener('click', () => {
            sfx.click.play();
            createWindow(icon.dataset.appId, icon.querySelector('span:last-child').textContent);
        });
    });

    // --- Interact.js Setup ---
    interact('.desktop-icon').draggable({ inertia: true, modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })], listeners: { move(event) { const target = event.target, x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx, y = (parseFloat(event.target.getAttribute('data-y')) || 0) + event.dy; target.style.transform = `translate(${x}px, ${y}px)`; target.setAttribute('data-x', x); target.setAttribute('data-y', y); } } });
    interact('.window').draggable({ allowFrom: '.window-header', inertia: true, modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })], listeners: { move(event) { const target = event.target, x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx, y = (parseFloat(event.target.getAttribute('data-y')) || 0) + event.dy; target.style.transform = `translate(${x}px, ${y}px)`; target.setAttribute('data-x', x); target.setAttribute('data-y', y); } } }).resizable({ edges: { left: true, right: true, bottom: true, top: false }, listeners: { move(event) { Object.assign(event.target.style, { width: `${event.rect.width}px`, height: `${event.rect.height}px` }); } }, modifiers: [interact.modifiers.restrictSize({ min: { width: 320, height: 240 } })] });
});