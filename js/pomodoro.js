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

    initializeTaskFiltering() {
        const filterBar = document.createElement('div');
        filterBar.className = 'task-filter-bar';
        filterBar.innerHTML = `
            <div class="filter-controls">
                <div class="search-container">
                    <input type="text" class="task-search" placeholder="Search tasks...">
                    <span class="search-icon">🔍</span>
                </div>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">All</button>
                    ${this.taskManager.categories.map(cat => 
                        `<button class="filter-btn" data-filter="${cat.toLowerCase()}">${cat}</button>`
                    ).join('')}
                </div>
                <div class="sort-controls">
                    <select class="sort-select">
                        <option value="priority">Priority</option>
                        <option value="date">Date</option>
                        <option value="pomodoros">Pomodoros</option>
                        <option value="title">Title</option>
                    </select>
                    <button class="sort-direction" data-direction="asc">↑</button>
                </div>
            </div>
            <div class="active-filters"></div>
        `;

        document.querySelector('.task-list-container').prepend(filterBar);
        this.bindFilterEvents();
    }

    bindFilterEvents() {
        const searchInput = document.querySelector('.task-search');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortSelect = document.querySelector('.sort-select');
        const sortDirection = document.querySelector('.sort-direction');

        searchInput.addEventListener('input', debounce(() => {
            this.filterTasks();
            this.animateFilteredTasks();
        }, 300));

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                this.filterTasks();
                this.animateFilteredTasks();
            });
        });

        sortSelect.addEventListener('change', () => {
            this.sortTasks(sortSelect.value, sortDirection.dataset.direction);
            this.animateFilteredTasks();
        });

        sortDirection.addEventListener('click', () => {
            const newDirection = sortDirection.dataset.direction === 'asc' ? 'desc' : 'asc';
            sortDirection.dataset.direction = newDirection;
            sortDirection.textContent = newDirection === 'asc' ? '↑' : '↓';
            this.sortTasks(sortSelect.value, newDirection);
            this.animateFilteredTasks();
        });
    }

    filterTasks() {
        const searchTerm = document.querySelector('.task-search').value.toLowerCase();
        const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active'))
            .map(btn => btn.dataset.filter);
        
        const filteredTasks = this.taskManager.taskHistory.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                                task.description.toLowerCase().includes(searchTerm);
            const matchesFilter = activeFilters.includes('all') ||
                                activeFilters.includes(task.category.toLowerCase());
            return matchesSearch && matchesFilter;
        });

        this.updateTaskList(filteredTasks);
        this.updateActiveFiltersDisplay(activeFilters);
    }

    sortTasks(criterion, direction) {
        const tasks = Array.from(document.querySelectorAll('.task-item'));
        const sortFunctions = {
            priority: (a, b) => this.comparePriority(a, b, direction),
            date: (a, b) => this.compareDate(a, b, direction),
            pomodoros: (a, b) => this.comparePomodoros(a, b, direction),
            title: (a, b) => this.compareTitle(a, b, direction)
        };

        tasks.sort(sortFunctions[criterion]);
        this.reorderTasksWithAnimation(tasks);
    }

    initializeEnhancedAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            /* Group Animations */
            .task-group {
                animation: slideInGroup 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes slideInGroup {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Staggered Task Animations */
            .task-item {
                opacity: 0;
                animation: slideInTask 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes slideInTask {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            /* Priority Visualizations */
            .priority-urgent {
                animation: urgentPulse 1.5s infinite;
                background: linear-gradient(45deg, #ff6b6b, #ff4757);
            }

            @keyframes urgentPulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
                }
            }

            /* Progress Bar Animations */
            .progress-bar {
                position: relative;
                overflow: hidden;
            }

            .progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 30px;
                background: linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0) 100%
                );
                animation: progressShimmer 1.5s infinite;
            }

            @keyframes progressShimmer {
                from {
                    transform: translateX(-100%);
                }
                to {
                    transform: translateX(400%);
                }
            }

            /* Group Header Hover Effects */
            .group-header {
                position: relative;
                overflow: hidden;
            }

            .group-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.1),
                    transparent
                );
                transform: translateX(-100%);
                transition: transform 0.3s;
            }

            .group-header:hover::before {
                transform: translateX(100%);
            }

            /* Task Count Badge Animation */
            .group-stats {
                position: relative;
            }

            .group-stats::after {
                content: attr(data-count);
                position: absolute;
                top: -8px;
                right: -8px;
                background: var(--tg-theme-button-color);
                color: var(--tg-theme-button-text-color);
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 0.8rem;
                opacity: 0;
                transform: scale(0);
                animation: badgePop 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes badgePop {
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            /* View Mode Transitions */
            .task-groups {
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .task-groups.switching-view {
                opacity: 0;
                transform: scale(0.95);
            }

            /* Completion Celebration */
            .task-complete {
                position: relative;
            }

            .task-complete::before {
                content: '🎉';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: celebrate 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes celebrate {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 0;
                }
                50% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 0;
                }
            }

            /* Priority Level Indicators */
            .priority-indicator {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }

            .priority-indicator::before {
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                animation: priorityPulse 2s infinite;
            }

            @keyframes priorityPulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.5);
                    opacity: 0.5;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
        `;

        document.head.appendChild(style);
    }

    reorderTasksWithAnimation(tasks) {
        const taskList = document.querySelector('.task-list');
        const positions = tasks.map(task => {
            const rect = task.getBoundingClientRect();
            return { top: rect.top, left: rect.left };
        });

        tasks.forEach((task, index) => {
            const initialPos = positions[index];
            task.style.position = 'absolute';
            task.style.top = `${initialPos.top}px`;
            task.style.left = `${initialPos.left}px`;
        });

        requestAnimationFrame(() => {
            tasks.forEach(task => {
                taskList.appendChild(task);
                task.style.position = '';
                task.style.top = '';
                task.style.left = '';
                task.classList.add('reordered');
            });
        });
    }

    animateFilteredTasks() {
        const tasks = document.querySelectorAll('.task-item');
        tasks.forEach(task => {
            task.classList.add('filtering');
            requestAnimationFrame(() => {
                task.classList.remove('filtering');
                task.classList.add('filtered-in');
            });
        });
    }

    // Comparison functions for sorting
    comparePriority(a, b, direction) {
        const priorities = { 'Urgent': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
        const priorityA = priorities[a.dataset.priority];
        const priorityB = priorities[b.dataset.priority];
        return direction === 'asc' ? priorityA - priorityB : priorityB - priorityA;
    }

    compareDate(a, b, direction) {
        const dateA = new Date(a.dataset.createdAt);
        const dateB = new Date(b.dataset.createdAt);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    comparePomodoros(a, b, direction) {
        const pomodorosA = parseInt(a.dataset.completedPomodoros);
        const pomodorosB = parseInt(b.dataset.completedPomodoros);
        return direction === 'asc' ? pomodorosA - pomodorosB : pomodorosB - pomodorosA;
    }

    compareTitle(a, b, direction) {
        const titleA = a.querySelector('h4').textContent;
        const titleB = b.querySelector('h4').textContent;
        return direction === 'asc' ? 
            titleA.localeCompare(titleB) : 
            titleB.localeCompare(titleA);
    }

    initializeTaskGrouping() {
        this.taskGroups = {
            byPriority: new Map(),
            byCategory: new Map(),
            byStatus: new Map(),
            byProgress: new Map()
        };

        const groupingControls = document.createElement('div');
        groupingControls.className = 'grouping-controls';
        groupingControls.innerHTML = `
            <div class="group-selector">
                <label>Group by:</label>
                <select class="group-select">
                    <option value="none">No Grouping</option>
                    <option value="priority">Priority</option>
                    <option value="category">Category</option>
                    <option value="status">Status</option>
                    <option value="progress">Progress</option>
                </select>
            </div>
            <div class="group-visualization">
                <button class="view-mode-btn" data-view="list">📝</button>
                <button class="view-mode-btn" data-view="board">📊</button>
                <button class="view-mode-btn" data-view="grid">📱</button>
            </div>
        `;

        document.querySelector('.task-filter-bar').appendChild(groupingControls);
        this.initializeGroupVisualization();
    }

    initializeGroupVisualization() {
        const style = document.createElement('style');
        style.textContent = `
            .task-groups {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .task-group {
                background: var(--tg-theme-bg-color);
                border-radius: 12px;
                padding: 1rem;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }

            .task-group:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .group-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid var(--tg-theme-hint-color);
            }

            .group-title {
                font-weight: bold;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .group-stats {
                font-size: 0.9rem;
                color: var(--tg-theme-hint-color);
            }

            /* Priority Visualization */
            .priority-indicator {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.9rem;
            }

            .priority-urgent {
                background: rgba(244, 67, 54, 0.1);
                color: #f44336;
                animation: urgentPulse 2s infinite;
            }

            .priority-high {
                background: rgba(255, 152, 0, 0.1);
                color: #ff9800;
            }

            .priority-medium {
                background: rgba(33, 150, 243, 0.1);
                color: #2196f3;
            }

            .priority-low {
                background: rgba(76, 175, 80, 0.1);
                color: #4caf50;
            }

            /* View Modes */
            .task-groups.board-view {
                flex-direction: row;
                overflow-x: auto;
                padding: 1rem;
                gap: 1rem;
            }

            .task-groups.board-view .task-group {
                min-width: 300px;
                max-width: 300px;
            }

            .task-groups.grid-view {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 1rem;
                padding: 1rem;
            }

            /* Progress Visualization */
            .progress-bar {
                height: 4px;
                background: var(--tg-theme-hint-color);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill {
                height: 100%;
                background: var(--tg-theme-button-color);
                transition: width 0.3s ease;
            }

            @keyframes urgentPulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
        `;

        document.head.appendChild(style);
    }

    updateTaskGroups(groupingType) {
        const tasks = this.taskManager.taskHistory;
        this.taskGroups = new Map();

        switch (groupingType) {
            case 'priority':
                this.groupByPriority(tasks);
                break;
            case 'category':
                this.groupByCategory(tasks);
                break;
            case 'status':
                this.groupByStatus(tasks);
                break;
            case 'progress':
                this.groupByProgress(tasks);
                break;
            default:
                return this.updateTaskList(tasks);
        }

        this.renderTaskGroups();
    }

    groupByPriority(tasks) {
        const priorities = ['Urgent', 'High', 'Medium', 'Low'];
        priorities.forEach(priority => {
            const tasksInPriority = tasks.filter(task => task.priority === priority);
            if (tasksInPriority.length > 0) {
                this.taskGroups.set(priority, {
                    tasks: tasksInPriority,
                    icon: this.getPriorityIcon(priority),
                    color: this.getPriorityColor(priority)
                });
            }
        });
    }

    groupByCategory(tasks) {
        this.taskManager.categories.forEach(category => {
            const tasksInCategory = tasks.filter(task => task.category === category);
            if (tasksInCategory.length > 0) {
                this.taskGroups.set(category, {
                    tasks: tasksInCategory,
                    icon: this.getCategoryIcon(category)
                });
            }
        });
    }

    groupByStatus(tasks) {
        const statuses = ['In Progress', 'Not Started', 'Completed'];
        statuses.forEach(status => {
            const tasksInStatus = tasks.filter(task => this.getTaskStatus(task) === status);
            if (tasksInStatus.length > 0) {
                this.taskGroups.set(status, {
                    tasks: tasksInStatus,
                    icon: this.getStatusIcon(status)
                });
            }
        });
    }

    groupByProgress(tasks) {
        const progressGroups = ['Just Started (0-25%)', 'In Progress (26-75%)', 'Almost Done (76-99%)', 'Completed (100%)'];
        progressGroups.forEach(group => {
            const tasksInProgress = tasks.filter(task => this.getProgressGroup(task) === group);
            if (tasksInProgress.length > 0) {
                this.taskGroups.set(group, {
                    tasks: tasksInProgress,
                    icon: this.getProgressIcon(group)
                });
            }
        });
    }

    renderTaskGroups() {
        const taskList = document.querySelector('.task-list');
        taskList.innerHTML = '';
        
        const groupsContainer = document.createElement('div');
        groupsContainer.className = 'task-groups';

        this.taskGroups.forEach((group, groupName) => {
            const groupElement = this.createGroupElement(groupName, group);
            groupsContainer.appendChild(groupElement);
        });

        taskList.appendChild(groupsContainer);
        this.initializeGroupAnimations();
    }

    createGroupElement(groupName, group) {
        const groupElement = document.createElement('div');
        groupElement.className = 'task-group';
        groupElement.innerHTML = `
            <div class="group-header">
                <div class="group-title">
                    <span class="group-icon">${group.icon}</span>
                    ${groupName}
                </div>
                <div class="group-stats">
                    ${group.tasks.length} tasks
                    ${this.getGroupProgress(group.tasks)}
                </div>
            </div>
            <div class="group-tasks"></div>
            ${this.createProgressBar(group.tasks)}
        `;

        const tasksContainer = groupElement.querySelector('.group-tasks');
        group.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });

        return groupElement;
    }

    getGroupProgress(tasks) {
        const completed = tasks.filter(task => 
            task.completedPomodoros >= task.estimatedPomodoros
        ).length;
        return `(${Math.round((completed / tasks.length) * 100)}% complete)`;
    }

    createProgressBar(tasks) {
        const totalPomodoros = tasks.reduce((sum, task) => sum + task.estimatedPomodoros, 0);
        const completedPomodoros = tasks.reduce((sum, task) => sum + task.completedPomodoros, 0);
        const percentage = (completedPomodoros / totalPomodoros) * 100;

        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
    }

    // Utility methods for icons and colors
    getPriorityIcon(priority) {
        const icons = {
            'Urgent': '🔴',
            'High': '🟠',
            'Medium': '🟡',
            'Low': '🟢'
        };
        return icons[priority] || '⚪';
    }

    getCategoryIcon(category) {
        const icons = {
            'Work': '💼',
            'Study': '📚',
            'Personal': '🏠',
            'Project': '🎯'
        };
        return icons[category] || '📋';
    }

    getStatusIcon(status) {
        const icons = {
            'In Progress': '⏳',
            'Not Started': '🆕',
            'Completed': '✅'
        };
        return icons[status] || '📋';
    }

    getProgressIcon(progress) {
        const icons = {
            'Just Started (0-25%)': '🌱',
            'In Progress (26-75%)': '🌿',
            'Almost Done (76-99%)': '🌳',
            'Completed (100%)': '🎉'
        };
        return icons[progress] || '📊';
    }

    applyStaggeredAnimation(elements, className, delay = 50) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.animationDelay = `${index * delay}ms`;
                element.classList.add(className);
            }, 0);
        });
    }

    switchViewMode(mode) {
        const container = document.querySelector('.task-groups');
        container.classList.add('switching-view');
        
        setTimeout(() => {
            container.className = `task-groups ${mode}-view`;
            this.renderTaskGroups();
            
            requestAnimationFrame(() => {
                container.classList.remove('switching-view');
                
                // Apply staggered animations to new elements
                const groups = document.querySelectorAll('.task-group');
                const tasks = document.querySelectorAll('.task-item');
                
                this.applyStaggeredAnimation(groups, 'animate-in', 100);
                this.applyStaggeredAnimation(tasks, 'animate-in', 50);
            });
        }, 300);
    }

    updateProgressBar(element, percentage) {
        const progressFill = element.querySelector('.progress-fill');
        const currentWidth = parseFloat(progressFill.style.width) || 0;
        
        // Animate progress bar
        anime({
            targets: progressFill,
            width: [`${currentWidth}%`, `${percentage}%`],
            duration: 800,
            easing: 'easeInOutQuart',
            update: function(anim) {
                // Add particle effects during progress update
                if (anim.progress % 10 === 0) {
                    this.createProgressParticle(progressFill);
                }
            }.bind(this)
        });
    }

    createProgressParticle(element) {
        const particle = document.createElement('div');
        particle.className = 'progress-particle';
        element.appendChild(particle);

        const rect = element.getBoundingClientRect();
        const size = Math.random() * 4 + 2;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2 + 1;

        anime({
            targets: particle,
            translateX: Math.cos(angle) * 30,
            translateY: Math.sin(angle) * 30,
            opacity: [1, 0],
            scale: [1, 0],
            duration: 1000,
            easing: 'easeOutExpo',
            complete: () => particle.remove()
        });
    }

    completeTask(taskElement) {
        taskElement.classList.add('task-complete');
        
        // Create celebration particles
        for (let i = 0; i < 20; i++) {
            this.createCelebrationParticle(taskElement);
        }

        setTimeout(() => {
            taskElement.classList.remove('task-complete');
        }, 1000);
    }

    createCelebrationParticle(element) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        element.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 60 + 30;
        const size = Math.random() * 6 + 4;
        const hue = Math.random() * 360;

        anime({
            targets: particle,
            translateX: Math.cos(angle) * velocity,
            translateY: Math.sin(angle) * velocity,
            scale: [1, 0],
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeOutExpo',
            complete: () => particle.remove()
        });
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 