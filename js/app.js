class App {
    constructor() {
        this.telegram = new TelegramUtils();
        this.dataManager = new DataManager();
        this.calendarManager = new CalendarManager(this.dataManager);
        this.pomodoroTimer = new PomodoroTimer(this.dataManager);
        this.viewManager = new ViewManager(this);
        this.touchDragManager = new TouchDragManager(this);
        this.gridLayoutManager = new GridLayoutManager(this);
        
        this.initializeFullscreenToggle();
        this.initializeDragAndDrop();
        this.initializeGestures();
    }

    initializeFullscreenToggle() {
        const toggle = document.getElementById('fullscreenToggle');
        toggle.addEventListener('click', () => {
            if (this.telegram.webapp) {
                this.telegram.webapp.expand();
            }
        });
    }

    initializeDragAndDrop() {
        const taskItems = document.querySelectorAll('.task-item');
        const calendar = document.querySelector('.calendar');

        taskItems.forEach(task => {
            task.setAttribute('draggable', true);
            task.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', task.dataset.taskId);
            });
        });

        calendar.addEventListener('dragover', (e) => e.preventDefault());
        calendar.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const dropDate = this.calendarManager.getDateFromPosition(e.clientX, e.clientY);
            
            if (dropDate) {
                this.dataManager.updateTaskDueDate(taskId, dropDate);
                this.calendarManager.renderCalendar();
            }
        });
    }

    initializeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    handleSwipe(startX, endX) {
        const SWIPE_THRESHOLD = 50;
        const views = ['calendar', 'tasks', 'pomodoro'];
        const currentIndex = views.indexOf(this.viewManager.currentView);
        
        if (Math.abs(startX - endX) > SWIPE_THRESHOLD) {
            if (startX > endX && currentIndex < views.length - 1) {
                // Swipe left
                this.viewManager.switchView(views[currentIndex + 1]);
            } else if (startX < endX && currentIndex > 0) {
                // Swipe right
                this.viewManager.switchView(views[currentIndex - 1]);
            }
        }
    }
} 