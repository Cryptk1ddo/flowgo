class PomodoroView {
    constructor(app) {
        this.app = app;
        this.container = this.createContainer();
        this.initializeView();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'view pomodoro-view';
        
        container.innerHTML = `
            <div class="view-header">
                <h1>Focus</h1>
                <button class="settings-btn">
                    <i class="ph ph-gear"></i>
                </button>
            </div>

            <div class="pomodoro-content">
                <div class="current-task">
                    <select class="task-select">
                        <option value="">Select Task</option>
                        ${this.getTaskOptionsHTML()}
                    </select>
                </div>

                <div class="timer-display">
                    <div class="timer-circle">
                        <svg viewBox="0 0 100 100">
                            <circle class="timer-bg" cx="50" cy="50" r="45"/>
                            <circle class="timer-progress" cx="50" cy="50" r="45"/>
                        </svg>
                        <div class="timer-time">25:00</div>
                    </div>
                </div>

                <div class="timer-controls">
                    <button class="timer-btn start">
                        <i class="ph ph-play"></i>
                    </button>
                    <button class="timer-btn reset">
                        <i class="ph ph-arrow-counter-clockwise"></i>
                    </button>
                </div>

                <div class="session-info">
                    <div class="session-count">Session 1/4</div>
                    <div class="session-type">Work Time</div>
                </div>
            </div>
        `;

        return container;
    }
} 