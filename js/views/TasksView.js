class TasksView {
    constructor(app) {
        this.app = app;
        this.container = this.createContainer();
        this.initializeView();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'view tasks-view';
        
        container.innerHTML = `
            <div class="view-header">
                <h1>Tasks</h1>
                <div class="view-actions">
                    <button class="filter-btn">
                        <i class="ph ph-funnel"></i>
                    </button>
                    <button class="add-task-btn">
                        <i class="ph ph-plus"></i>
                    </button>
                </div>
            </div>

            <div class="tasks-content">
                <div class="tasks-search">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" placeholder="Search tasks...">
                </div>

                <div class="task-categories">
                    <button class="category active">All</button>
                    <button class="category">Today</button>
                    <button class="category">Upcoming</button>
                    <button class="category">Completed</button>
                </div>

                <div class="tasks-list">
                    ${this.getTasksListHTML()}
                </div>
            </div>
        `;

        return container;
    }
} 