class ViewManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'calendar';
        this.views = {
            calendar: document.querySelector('.calendar-view'),
            tasks: document.querySelector('.tasks-view'),
            pomodoro: document.querySelector('.pomodoro-view')
        };
        
        this.initializeNavigation();
    }

    initializeNavigation() {
        const nav = document.querySelector('.bottom-nav');
        nav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.bottom-nav-item');
            if (navItem) {
                const view = navItem.dataset.view;
                this.switchView(view);
            }
        });
    }

    switchView(view) {
        // Hide all views
        Object.values(this.views).forEach(v => v.style.display = 'none');
        
        // Show selected view
        this.views[view].style.display = 'block';
        
        // Update navigation
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
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