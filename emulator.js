class Emulator {
    constructor() {
        this.canvas = document.getElementById('nes-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gamepadStatus = document.getElementById('gamepad-status');
        this.gamepads = {};

        this.nes = new jsnes.NES({
            onFrame: this.onFrame.bind(this),
            onStatusUpdate: console.log,
        });

        this.frameBuffer = new ArrayBuffer(256 * 240 * 4);
        this.frameBuffer8 = new Uint8ClampedArray(this.frameBuffer);
        this.frameBuffer32 = new Uint32Array(this.frameBuffer);

        this.romInput = document.getElementById('rom-input');
        this.romInput.addEventListener('change', this.loadROM.bind(this));

        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));

        this.setupGamepadListeners();
        this.gameLoop();

        // Initial canvas scaling
        this.scaleCanvas();
        window.addEventListener('resize', this.scaleCanvas.bind(this));
        document.addEventListener('fullscreenchange', this.scaleCanvas.bind(this));
    }

    setupGamepadListeners() {
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected:", e.gamepad);
            this.gamepads[e.gamepad.index] = e.gamepad;
            this.updateGamepadStatus();
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log("Gamepad disconnected:", e.gamepad);
            delete this.gamepads[e.gamepad.index];
            this.updateGamepadStatus();
        });
    }

    updateGamepadStatus() {
        this.gamepadStatus.textContent = `Gamepads connected: ${Object.keys(this.gamepads).length}`;
    }

    loadROM(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const contents = e.target.result;
                    this.nes.loadROM(contents);
                    this.start();
                    this.showMessage('ROM loaded successfully!', 'success');
                } catch (error) {
                    console.error('Failed to load ROM:', error);
                    this.showMessage('Failed to load ROM. Please try another file.', 'error');
                }
            };
            reader.onerror = (e) => {
                console.error('Error reading file:', e);
                this.showMessage('Error reading file. Please try again.', 'error');
            };
            reader.readAsBinaryString(file);
        }
    }

    start() {
        this.frameId = requestAnimationFrame(this.frame.bind(this));
    }

    frame() {
        this.nes.frame();
        this.handleInput();
        this.frameId = requestAnimationFrame(this.frame.bind(this));
    }

    onFrame(frameBuffer) {
        for (let i = 0; i < 256 * 240; i++) {
            this.frameBuffer32[i] = 0xFF000000 | frameBuffer[i];
        }
        this.imageData = new ImageData(this.frameBuffer8, 256, 240);
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    handleInput() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const gamepad of gamepads) {
            if (gamepad) {
                // Map gamepad buttons to NES controller
                const buttonStates = [
                    { nesButton: jsnes.Controller.BUTTON_A, gpButton: 0 },
                    { nesButton: jsnes.Controller.BUTTON_B, gpButton: 2 },
                    { nesButton: jsnes.Controller.BUTTON_SELECT, gpButton: 8 },
                    { nesButton: jsnes.Controller.BUTTON_START, gpButton: 9 },
                    { nesButton: jsnes.Controller.BUTTON_UP, gpButton: 12 },
                    { nesButton: jsnes.Controller.BUTTON_DOWN, gpButton: 13 },
                    { nesButton: jsnes.Controller.BUTTON_LEFT, gpButton: 14 },
                    { nesButton: jsnes.Controller.BUTTON_RIGHT, gpButton: 15 },
                ];

                buttonStates.forEach(({ nesButton, gpButton }) => {
                    const isPressed = gamepad.buttons[gpButton].pressed;
                    this.nes.buttonDown(1, nesButton, isPressed);
                    if (!isPressed) {
                        this.nes.buttonUp(1, nesButton);
                    }
                });

                // Handle analog sticks
                const axesThreshold = 0.5;
                if (gamepad.axes[0] < -axesThreshold) this.nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT, true);
                else if (gamepad.axes[0] > axesThreshold) this.nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT, true);
                else {
                    this.nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT);
                    this.nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT);
                }

                if (gamepad.axes[1] < -axesThreshold) this.nes.buttonDown(1, jsnes.Controller.BUTTON_UP, true);
                else if (gamepad.axes[1] > axesThreshold) this.nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN, true);
                else {
                    this.nes.buttonUp(1, jsnes.Controller.BUTTON_UP);
                    this.nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN);
                }
            }
        }
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    scaleCanvas() {
        const container = document.getElementById('emulator-container');
        const canvas = document.getElementById('nes-canvas');
        const aspectRatio = 256 / 240;

        let width, height;

        if (document.fullscreenElement) {
            width = window.innerWidth;
            height = window.innerHeight;
        } else {
            width = container.clientWidth;
            height = container.clientHeight;
        }

        if (width / height > aspectRatio) {
            canvas.style.width = `${height * aspectRatio}px`;
            canvas.style.height = `${height}px`;
        } else {
            canvas.style.width = `${width}px`;
            canvas.style.height = `${width / aspectRatio}px`;
        }
    }

    showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.position = 'fixed';
        messageElement.style.top = '20px';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translateX(-50%)';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.color = 'white';
        messageElement.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        messageElement.style.zIndex = '1000';

        document.body.appendChild(messageElement);

        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 3000);
    }
}