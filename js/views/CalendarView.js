class CalendarView {
    constructor(app) {
        this.app = app;
        this.container = this.createContainer();
        this.initializeView();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'view calendar-view';
        
        container.innerHTML = `
            <div class="view-header">
                <h1>Calendar</h1>
                <button class="add-event-btn">
                    <i class="ph ph-plus"></i>
                </button>
            </div>

            <div class="calendar-content">
                <div class="calendar-nav">
                    <button class="nav-btn prev">
                        <i class="ph ph-caret-left"></i>
                    </button>
                    <h2 class="current-month">September 2023</h2>
                    <button class="nav-btn next">
                        <i class="ph ph-caret-right"></i>
                    </button>
                </div>

                <div class="calendar-grid">
                    <div class="weekdays">
                        ${this.getWeekdaysHTML()}
                    </div>
                    <div class="days">
                        ${this.getDaysHTML()}
                    </div>
                </div>

                <div class="events-list">
                    <h3>Today's Events</h3>
                    <div class="events-container">
                        ${this.getTodaysEventsHTML()}
                    </div>
                </div>
            </div>
        `;

        return container;
    }
} 