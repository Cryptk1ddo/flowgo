class DataManager {
    constructor() {
        this.events = new Map();
        this.tasks = new Map();
        this.taskLists = new Map();
        this.pomodoroSessions = new Map();
        
        // Load data from localStorage
        this.loadData();
    }

    loadData() {
        try {
            const data = JSON.parse(localStorage.getItem('appData')) || {};
            this.events = new Map(Object.entries(data.events || {}));
            this.tasks = new Map(Object.entries(data.tasks || {}));
            this.taskLists = new Map(Object.entries(data.taskLists || {}));
            this.pomodoroSessions = new Map(Object.entries(data.pomodoroSessions || {}));
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    saveData() {
        const data = {
            events: Object.fromEntries(this.events),
            tasks: Object.fromEntries(this.tasks),
            taskLists: Object.fromEntries(this.taskLists),
            pomodoroSessions: Object.fromEntries(this.pomodoroSessions)
        };
        localStorage.setItem('appData', JSON.stringify(data));
    }

    // Event methods
    addEvent(event) {
        this.events.set(event.id, event);
        this.saveData();
    }

    updateEvent(event) {
        if (this.events.has(event.id)) {
            this.events.set(event.id, event);
            this.saveData();
        }
    }

    deleteEvent(eventId) {
        this.events.delete(eventId);
        this.saveData();
    }

    getEventsInRange(startDate, endDate) {
        return Array.from(this.events.values()).filter(event => 
            event.startDate >= startDate && event.endDate <= endDate
        );
    }

    // Task methods
    addTask(task) {
        this.tasks.set(task.id, task);
        this.saveData();
    }

    updateTask(task) {
        if (this.tasks.has(task.id)) {
            this.tasks.set(task.id, task);
            this.saveData();
        }
    }

    deleteTask(taskId) {
        this.tasks.delete(taskId);
        this.saveData();
    }

    getTasksByList(listId) {
        return Array.from(this.tasks.values())
            .filter(task => task.listId === listId);
    }

    // TaskList methods
    addTaskList(list) {
        this.taskLists.set(list.id, list);
        this.saveData();
    }

    // Pomodoro methods
    addPomodoroSession(session) {
        this.pomodoroSessions.set(session.id, session);
        if (session.taskId) {
            const task = this.tasks.get(session.taskId);
            if (task) {
                task.pomodoroSessions.push(session.id);
                this.updateTask(task);
            }
        }
        this.saveData();
    }

    getTaskPomodoroSessions(taskId) {
        return Array.from(this.pomodoroSessions.values())
            .filter(session => session.taskId === taskId);
    }
} 