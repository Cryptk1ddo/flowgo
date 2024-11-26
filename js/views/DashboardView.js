class DashboardView {
    constructor(app) {
        this.app = app;
        this.container = this.createContainer();
        this.initializeView();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'view dashboard-view';
        
        container.innerHTML = `
            <div class="view-header">
                <h1>Dashboard</h1>
                <div class="user-profile">
                    <div class="avatar"></div>
                </div>
            </div>

            <div class="dashboard-content">
                <div class="quick-stats">
                    <div class="stat-card primary">
                        <div class="stat-value">${this.getTodaysTasks()}</div>
                        <div class="stat-label">Today's Tasks</div>
                    </div>
                    <div class="stat-card secondary">
                        <div class="stat-value">${this.getFocusTime()}</div>
                        <div class="stat-label">Focus Time</div>
                    </div>
                </div>

                <div class="section upcoming-tasks">
                    <div class="section-header">
                        <h2>Upcoming</h2>
                        <button class="view-all">View All</button>
                    </div>
                    <div class="task-preview-list">
                        ${this.getUpcomingTasksHTML()}
                    </div>
                </div>

                <div class="section focus-stats">
                    <h2>Focus Stats</h2>
                    <div class="weekly-chart">
                        ${this.getWeeklyStatsHTML()}
                    </div>
                </div>
            </div>
        `;

        return container;
    }
} 