class PomodoroTimer {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.settings = this.loadSettings();
        this.currentTask = null;
        this.sessionHistory = [];
        
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
        container.className = 'pomodoro-view view';
        
        container.innerHTML = `
            <div class="pomodoro-header">
                <div class="task-info">
                    <select class="task-select">
                        <option value="">Select Task</option>
                    </select>
                    <button class="btn-icon">
                        <i class="ph ph-plus"></i>
                    </button>
                </div>
            </div>

            <div class="timer-display">
                <div class="timer-circle">
                    <svg viewBox="0 0 100 100">
                        <circle class="progress-bg" cx="50" cy="50" r="45"/>
                        <circle class="progress" cx="50" cy="50" r="45"/>
                    </svg>
                    <div class="timer-time">25:00</div>
                </div>
            </div>

            <div class="timer-controls">
                <button class="btn-icon" id="startTimer">
                    <i class="ph ph-play"></i>
                </button>
                <button class="btn-icon" id="pauseTimer">
                    <i class="ph ph-pause"></i>
                </button>
                <button class="btn-icon" id="resetTimer">
                    <i class="ph ph-arrow-counter-clockwise"></i>
                </button>
            </div>

            <div class="session-info">
                <div class="session-dots">
                    ${Array(4).fill().map(() => `
                        <div class="session-dot"></div>
                    `).join('')}
                </div>
                <div class="session-stats">
                    <div class="stat">
                        <span class="stat-value">0</span>
                        <span class="stat-label">Focus Time</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">0/4</span>
                        <span class="stat-label">Sessions</span>
                    </div>
                </div>
            </div>
        `;

        return container;
    }

    updateTaskSelect() {
        const select = this.container.querySelector('#taskSelect');
        const tasks = this.dataManager.getTasks().filter(task => !task.completed);
        
        select.innerHTML = `
            <option value="">Select Task</option>
            ${tasks.map(task => `
                <option value="${task.id}" 
                        ${this.currentTask?.id === task.id ? 'selected' : ''}>
                    ${task.title}
                </option>
            `).join('')}
        `;
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => this.tick(), 1000);
            this.updateControls();
            
            // Update calendar event
            if (this.currentTask) {
                this.createOrUpdateCalendarEvent();
            }
        }
    }

    createOrUpdateCalendarEvent() {
        const event = {
            title: `🍅 ${this.currentTask.title}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + this.timeLeft * 1000),
            category: 'pomodoro',
            taskId: this.currentTask.id
        };

        this.dataManager.addEvent(event);
    }

    completeSession() {
        const session = {
            taskId: this.currentTask?.id,
            duration: this.settings.workDuration * 60 - this.timeLeft,
            timestamp: new Date(),
            type: this.isWorkSession ? 'work' : 'break'
        };

        this.sessionHistory.push(session);
        this.updateStats();

        if (this.currentTask) {
            this.updateTaskProgress();
        }

        // Show completion notification
        this.showSessionComplete();
    }

    updateTaskProgress() {
        const task = this.currentTask;
        const totalPomodoros = this.sessionHistory.filter(
            s => s.taskId === task.id && s.type === 'work'
        ).length;

        task.pomodoroCount = totalPomodoros;
        this.dataManager.updateTask(task);

        // Update task in calendar if exists
        this.dataManager.getEvents()
            .filter(event => event.taskId === task.id)
            .forEach(event => {
                event.progress = Math.min((totalPomodoros / task.estimatedPomodoros) * 100, 100);
                this.dataManager.updateEvent(event);
            });
    }

    showSessionComplete() {
        const notification = document.createElement('div');
        notification.className = 'session-complete-notification';
        
        notification.innerHTML = `
            <div class="notification-content">
                <h3>${this.isWorkSession ? 'Break Time!' : 'Back to Work!'}</h3>
                <p>${this.getSessionSummary()}</p>
                ${this.isWorkSession ? this.getBreakOptions() : ''}
            </div>
        `;

        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));

        // Trigger haptic feedback
        this.telegram?.hapticFeedback('success');
    }

    getSessionSummary() {
        if (!this.currentTask) return '';
        
        const totalPomodoros = this.sessionHistory.filter(
            s => s.taskId === this.currentTask.id && s.type === 'work'
        ).length;

        return `
            <div class="session-summary">
                <div class="summary-stat">
                    <span class="material-icons">timer</span>
                    ${this.formatTime(this.settings.workDuration * 60)}
                </div>
                <div class="summary-stat">
                    <span class="material-icons">check_circle</span>
                    ${totalPomodoros} pomodoros
                </div>
            </div>
        `;
    }

    initializeBreakActivities() {
        this.breakActivities = {
            stretching: {
                icon: '🧘‍♂️',
                title: 'Quick Stretch',
                duration: 3,
                exercises: [
                    'Neck rotations',
                    'Shoulder rolls',
                    'Wrist stretches',
                    'Standing back bend'
                ]
            },
            meditation: {
                icon: '🧘',
                title: 'Brief Meditation',
                duration: 2,
                guidedText: 'Focus on your breath...'
            },
            eyeRest: {
                icon: '👁️',
                title: '20-20-20 Rule',
                duration: 1,
                instruction: 'Look at something 20 feet away for 20 seconds'
            },
            hydration: {
                icon: '💧',
                title: 'Hydration Break',
                duration: 1,
                reminder: 'Drink some water!'
            }
        };
    }

    showBreakActivities() {
        const breakSheet = document.createElement('div');
        breakSheet.className = 'break-sheet';
        
        breakSheet.innerHTML = `
            <div class="break-header">
                <h3>Break Time! (${this.formatTime(this.timeLeft)})</h3>
                <div class="break-progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
            
            <div class="break-activities">
                ${Object.entries(this.breakActivities).map(([key, activity]) => `
                    <div class="break-activity-card" data-activity="${key}">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-duration">${activity.duration}min</div>
                    </div>
                `).join('')}
            </div>

            <div class="activity-detail hidden">
                <button class="back-btn">←</button>
                <div class="activity-content"></div>
            </div>
        `;

        document.body.appendChild(breakSheet);
        requestAnimationFrame(() => breakSheet.classList.add('show'));

        this.bindBreakActivityEvents(breakSheet);
    }

    bindBreakActivityEvents(sheet) {
        sheet.querySelectorAll('.break-activity-card').forEach(card => {
            card.addEventListener('click', () => {
                const activity = this.breakActivities[card.dataset.activity];
                this.startBreakActivity(activity, sheet);
            });
        });
    }

    startBreakActivity(activity, sheet) {
        const detail = sheet.querySelector('.activity-detail');
        const content = detail.querySelector('.activity-content');
        
        content.innerHTML = this.getActivityContent(activity);
        sheet.querySelector('.break-activities').classList.add('hidden');
        detail.classList.remove('hidden');

        if (activity.timer) {
            this.startActivityTimer(activity, content);
        }
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