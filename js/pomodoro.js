class PomodoroTimer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.settings = this.loadSettings();
        
        // Timer state
        this.timeLeft = this.settings.workDuration * 60;
        this.isRunning = false;
        this.isWorkSession = true;
        this.currentSession = 1;
        
        this.initializeUI();
        this.bindEvents();
        this.updateDisplay();
    }

    loadSettings() {
        const defaultSettings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: true,
            autoStartWork: true,
            notifications: {
                sound: true,
                vibration: true,
                telegram: true
            },
            theme: {
                work: '#FF6B6B',
                shortBreak: '#4ECDC4',
                longBreak: '#45B7D1'
            }
        };

        const savedSettings = localStorage.getItem('pomodoroSettings');
        return savedSettings ? {...defaultSettings, ...JSON.parse(savedSettings)} : defaultSettings;
    }

    initializeUI() {
        const container = document.createElement('div');
        container.className = 'pomodoro-container';
        
        container.innerHTML = `
            <div class="pomodoro-header">
                <div class="session-indicator">
                    ${Array(this.settings.sessionsUntilLongBreak).fill()
                        .map((_, i) => `<div class="session-dot${i === 0 ? ' active' : ''}"></div>`)
                        .join('')}
                </div>
                <select id="taskSelect" class="task-select">
                    <option value="">Select Task</option>
                </select>
            </div>

            <div class="timer-display">
                <span id="minutes">25</span>:<span id="seconds">00</span>
            </div>

            <div class="timer-controls">
                <button id="startTimer" class="control-btn primary">Start</button>
                <button id="pauseTimer" class="control-btn" disabled>Pause</button>
                <button id="resetTimer" class="control-btn">Reset</button>
                <button id="settingsBtn" class="control-btn icon-btn">⚙️</button>
            </div>

            <div class="settings-panel" hidden>
                <div class="settings-header">
                    <h3>Timer Settings</h3>
                    <button class="close-btn">×</button>
                </div>

                <div class="settings-content">
                    <div class="settings-section">
                        <h4>Duration (minutes)</h4>
                        <div class="duration-inputs">
                            <label>
                                Work
                                <input type="number" id="workTime" 
                                    value="${this.settings.workDuration}" 
                                    min="1" max="60">
                            </label>
                            <label>
                                Short Break
                                <input type="number" id="shortBreakTime" 
                                    value="${this.settings.shortBreakDuration}" 
                                    min="1" max="30">
                            </label>
                            <label>
                                Long Break
                                <input type="number" id="longBreakTime" 
                                    value="${this.settings.longBreakDuration}" 
                                    min="1" max="45">
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4>Sessions until Long Break</h4>
                        <input type="range" id="sessionsCount" 
                            min="2" max="6" 
                            value="${this.settings.sessionsUntilLongBreak}">
                        <span class="sessions-label">${this.settings.sessionsUntilLongBreak} sessions</span>
                    </div>

                    <div class="settings-section">
                        <h4>Auto Start</h4>
                        <label class="switch">
                            <input type="checkbox" id="autoStartBreaks" 
                                ${this.settings.autoStartBreaks ? 'checked' : ''}>
                            <span class="slider"></span>
                            Auto-start Breaks
                        </label>
                        <label class="switch">
                            <input type="checkbox" id="autoStartWork" 
                                ${this.settings.autoStartWork ? 'checked' : ''}>
                            <span class="slider"></span>
                            Auto-start Work sessions
                        </label>
                    </div>

                    <div class="settings-section">
                        <h4>Notifications</h4>
                        <label class="switch">
                            <input type="checkbox" id="soundNotification" 
                                ${this.settings.notifications.sound ? 'checked' : ''}>
                            <span class="slider"></span>
                            Sound
                        </label>
                        <label class="switch">
                            <input type="checkbox" id="vibrationNotification" 
                                ${this.settings.notifications.vibration ? 'checked' : ''}>
                            <span class="slider"></span>
                            Vibration
                        </label>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.cacheElements();
        this.updateTaskList();
        this.applyTheme();
    }

    cacheElements() {
        // Cache DOM elements
        this.elements = {
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            startButton: document.getElementById('startTimer'),
            pauseButton: document.getElementById('pauseTimer'),
            resetButton: document.getElementById('resetTimer'),
            settingsButton: document.getElementById('settingsBtn'),
            settingsPanel: document.querySelector('.settings-panel'),
            sessionDots: document.querySelectorAll('.session-dot'),
            taskSelect: document.getElementById('taskSelect')
        };
    }

    bindEvents() {
        this.elements.startButton.addEventListener('click', () => this.start());
        this.elements.pauseButton.addEventListener('click', () => this.pause());
        this.elements.resetButton.addEventListener('click', () => this.reset());
        this.elements.settingsButton.addEventListener('click', () => this.toggleSettings());

        // Settings panel events
        document.querySelectorAll('.settings-content input').forEach(input => {
            input.addEventListener('change', () => this.updateSettings());
        });

        this.elements.taskSelect.addEventListener('change', (e) => {
            this.currentTaskId = e.target.value;
        });
    }

    toggleSettings() {
        this.elements.settingsPanel.hidden = !this.elements.settingsPanel.hidden;
    }

    updateSettings() {
        const newSettings = {
            workDuration: parseInt(document.getElementById('workTime').value),
            shortBreakDuration: parseInt(document.getElementById('shortBreakTime').value),
            longBreakDuration: parseInt(document.getElementById('longBreakTime').value),
            sessionsUntilLongBreak: parseInt(document.getElementById('sessionsCount').value),
            autoStartBreaks: document.getElementById('autoStartBreaks').checked,
            autoStartWork: document.getElementById('autoStartWork').checked,
            notifications: {
                sound: document.getElementById('soundNotification').checked,
                vibration: document.getElementById('vibrationNotification').checked,
                telegram: true
            }
        };

        this.settings = newSettings;
        localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
        
        // Update UI elements
        this.updateSessionIndicators();
        if (!this.isRunning) {
            this.timeLeft = this.settings.workDuration * 60;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.elements.minutes.textContent = minutes.toString().padStart(2, '0');
        this.elements.seconds.textContent = seconds.toString().padStart(2, '0');
        
        // Update button states
        this.elements.startButton.disabled = this.isRunning;
        this.elements.pauseButton.disabled = !this.isRunning;
    }

    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now();
        this.endTime = this.startTime + (this.timeLeft * 1000);
        
        this.isRunning = true;
        this.tick();
    }

    tick() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        if (now >= this.endTime) {
            this.handleSessionComplete();
            return;
        }
        
        this.timeLeft = Math.ceil((this.endTime - now) / 1000);
        this.updateDisplay();
        
        requestAnimationFrame(() => this.tick());
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timerId);
        this.updateDisplay();
    }

    reset() {
        this.pause();
        this.isWorkSession = true;
        this.timeLeft = parseInt(this.workTimeInput.value) * 60;
        this.updateDisplay();
    }

    handleSessionComplete() {
        this.pause();
        this.notifySessionComplete();
        
        if (this.isWorkSession) {
            this.currentSession++;
            const isLongBreak = this.currentSession > this.settings.sessionsUntilLongBreak;
            
            if (isLongBreak) {
                this.currentSession = 1;
                this.timeLeft = this.settings.longBreakDuration * 60;
            } else {
                this.timeLeft = this.settings.shortBreakDuration * 60;
            }
            
            this.updateSessionIndicators();
            this.savePomodoroSession();
        } else {
            this.timeLeft = this.settings.workDuration * 60;
        }
        
        this.isWorkSession = !this.isWorkSession;
        this.applyTheme();
        
        // Auto-start next session if enabled
        if ((this.isWorkSession && this.settings.autoStartWork) || 
            (!this.isWorkSession && this.settings.autoStartBreaks)) {
            this.start();
        }
    }

    notifySessionComplete() {
        const message = this.isWorkSession ? 
            'Work session complete! Time for a break.' : 
            'Break time is over! Ready to work?';

        if (this.settings.notifications.sound) {
            this.playNotificationSound();
        }

        if (this.settings.notifications.vibration && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        if (this.settings.notifications.telegram && window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            window.Telegram.WebApp.showAlert(message);
        }
    }

    updateSessionIndicators() {
        this.elements.sessionDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < this.currentSession);
            dot.classList.toggle('completed', index < this.currentSession - 1);
        });
    }

    applyTheme() {
        const theme = this.isWorkSession ? 
            this.settings.theme.work : 
            (this.currentSession >= this.settings.sessionsUntilLongBreak ? 
                this.settings.theme.longBreak : 
                this.settings.theme.shortBreak);
        
        document.documentElement.style.setProperty('--timer-color', theme);
    }

    initializeTaskIntegration() {
        this.taskManager = {
            currentTask: null,
            taskHistory: [],
            taskStats: new Map(), // Track time spent per task
            categories: ['Work', 'Study', 'Personal', 'Project'],
            priorities: ['Low', 'Medium', 'High', 'Urgent']
        };

        // Add task management UI
        const taskPanel = document.createElement('div');
        taskPanel.className = 'task-panel';
        taskPanel.innerHTML = `
            <div class="task-header">
                <h3>Current Task</h3>
                <button class="add-task-btn">+</button>
            </div>
            <div class="current-task-container">
                <div class="no-task-message">No task selected</div>
            </div>
            <div class="task-list-container">
                <h4>Upcoming Tasks</h4>
                <div class="task-list"></div>
            </div>
        `;

        this.elements.container.appendChild(taskPanel);
        this.initializeTaskControls();
    }

    initializeTaskControls() {
        const addTaskBtn = document.querySelector('.add-task-btn');
        addTaskBtn.addEventListener('click', () => this.showTaskDialog());

        // Add task drag and drop
        this.initializeTaskDragDrop();
        
        // Initialize task animations
        this.initializeTaskAnimations();
    }

    showTaskDialog(existingTask = null) {
        const dialog = document.createElement('div');
        dialog.className = 'task-dialog';
        dialog.innerHTML = `
            <div class="task-dialog-content">
                <h3>${existingTask ? 'Edit Task' : 'New Task'}</h3>
                <form id="taskForm" class="task-form">
                    <input type="text" name="title" placeholder="Task Title" 
                           value="${existingTask?.title || ''}" required>
                    
                    <textarea name="description" placeholder="Description"
                            >${existingTask?.description || ''}</textarea>
                    
                    <div class="task-options">
                        <select name="category" required>
                            ${this.taskManager.categories.map(cat => `
                                <option value="${cat}" ${existingTask?.category === cat ? 'selected' : ''}>
                                    ${cat}
                                </option>
                            `).join('')}
                        </select>
                        
                        <select name="priority" required>
                            ${this.taskManager.priorities.map(priority => `
                                <option value="${priority}" 
                                    ${existingTask?.priority === priority ? 'selected' : ''}>
                                    ${priority}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="estimated-pomodoros">
                        <label>Estimated Pomodoros:</label>
                        <input type="number" name="estimatedPomodoros" 
                               value="${existingTask?.estimatedPomodoros || 1}" min="1" max="10">
                    </div>

                    <div class="task-dialog-buttons">
                        <button type="submit" class="primary">Save</button>
                        <button type="button" class="secondary">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(dialog);
        this.setupTaskDialogAnimations(dialog);
        this.bindTaskDialogEvents(dialog, existingTask);
    }

    setupTaskDialogAnimations(dialog) {
        // Initial state
        dialog.style.opacity = '0';
        dialog.querySelector('.task-dialog-content').style.transform = 'scale(0.8)';
        
        // Trigger animation
        requestAnimationFrame(() => {
            dialog.style.opacity = '1';
            dialog.querySelector('.task-dialog-content').style.transform = 'scale(1)';
        });
    }

    bindTaskDialogEvents(dialog, existingTask) {
        const form = dialog.querySelector('#taskForm');
        const cancelBtn = dialog.querySelector('button.secondary');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const taskData = {
                id: existingTask?.id || crypto.randomUUID(),
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                estimatedPomodoros: parseInt(formData.get('estimatedPomodoros')),
                completedPomodoros: existingTask?.completedPomodoros || 0,
                createdAt: existingTask?.createdAt || new Date(),
                updatedAt: new Date()
            };

            this.saveTask(taskData, existingTask);
            this.closeTaskDialog(dialog);
        });

        cancelBtn.addEventListener('click', () => this.closeTaskDialog(dialog));
    }

    closeTaskDialog(dialog) {
        dialog.style.opacity = '0';
        dialog.querySelector('.task-dialog-content').style.transform = 'scale(0.8)';
        setTimeout(() => dialog.remove(), 300);
    }

    saveTask(taskData, existingTask) {
        if (existingTask) {
            const index = this.taskManager.taskHistory.findIndex(t => t.id === existingTask.id);
            if (index !== -1) {
                this.taskManager.taskHistory[index] = taskData;
            }
        } else {
            this.taskManager.taskHistory.unshift(taskData);
        }

        this.updateTaskList();
        this.saveTasksToStorage();
    }

    updateTaskList() {
        const taskList = document.querySelector('.task-list');
        taskList.innerHTML = '';

        this.taskManager.taskHistory.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const element = document.createElement('div');
        element.className = 'task-item';
        element.dataset.taskId = task.id;
        element.draggable = true;

        element.innerHTML = `
            <div class="task-priority ${task.priority.toLowerCase()}"></div>
            <div class="task-content">
                <h4>${task.title}</h4>
                <div class="task-meta">
                    <span class="task-category">${task.category}</span>
                    <span class="pomodoro-count">
                        ${task.completedPomodoros}/${task.estimatedPomodoros} 🍅
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-task">✏️</button>
                <button class="delete-task">🗑️</button>
            </div>
        `;

        this.bindTaskElementEvents(element, task);
        return element;
    }

    initializeTaskAnimations() {
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            .task-item {
                transition: all 0.3s ease;
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .task-item.completing {
                animation: complete 0.5s ease;
            }

            @keyframes complete {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .task-item.removing {
                animation: removeTask 0.3s ease forwards;
            }

            @keyframes removeTask {
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;

        document.head.appendChild(style);
    }

    initializeTaskDragDrop() {
        const taskList = document.querySelector('.task-list');
        
        taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            }
        });

        taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
            }
        });

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement) {
                taskList.insertBefore(draggable, afterElement);
            } else {
                taskList.appendChild(draggable);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
} 