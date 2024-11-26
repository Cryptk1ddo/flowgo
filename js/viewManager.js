class ViewManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'dashboard';
        this.views = {
            dashboard: new DashboardView(app),
            calendar: new CalendarView(app),
            tasks: new TasksView(app),
            pomodoro: new PomodoroView(app)
        };
        
        this.initializeViews();
    }

    initializeViews() {
        this.container = document.querySelector('.app-container');
        this.setupNavigationHandlers();
        this.showView(this.currentView);
    }

    setupNavigationHandlers() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('href').substring(1);
                this.switchView(view);
            });
        });
    }

    switchView(view) {
        // Hide all views
        Object.values(this.views).forEach(v => v.style.display = 'none');
        
        // Show selected view
        this.views[view].style.display = 'block';
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
        
        // Update current view and trigger specific view updates
        this.currentView = view;
        this.updateCurrentView();
    }

    updateCurrentView() {
        switch(this.currentView) {
            case 'calendar':
                this.app.calendarManager.renderCalendar();
                break;
            case 'tasks':
                this.app.pomodoroTimer.updateTaskList();
                break;
            case 'pomodoro':
                this.app.pomodoroTimer.updateDisplay();
                break;
        }
    }
} 