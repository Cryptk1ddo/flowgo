class App {
    constructor() {
        this.telegram = new TelegramUtils();
        this.dataManager = new DataManager();
        this.calendarManager = new CalendarManager(this.dataManager);
        this.pomodoroTimer = new PomodoroTimer(this.dataManager);
        
        this.initializeFullscreenToggle();
        this.initializeDragAndDrop();
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
} 