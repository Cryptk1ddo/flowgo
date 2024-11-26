class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        
        // DOM elements
        this.monthYearElement = document.getElementById('monthYear');
        this.daysGrid = document.getElementById('daysGrid');
        
        // Bind navigation events
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
        
        // Initial render
        this.renderCalendar();
    }

    navigateMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    getMonthData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const startingDayIndex = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        return { startingDayIndex, totalDays, year, month };
    }

    formatMonthYear(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    renderCalendar() {
        // Update header
        this.monthYearElement.textContent = this.formatMonthYear(this.currentDate);
        
        // Clear existing days
        this.daysGrid.innerHTML = '';
        
        const { startingDayIndex, totalDays, year, month } = this.getMonthData();
        const today = new Date();
        
        // Add previous month's days
        for (let i = 0; i < startingDayIndex; i++) {
            const prevMonthDays = new Date(year, month, 0).getDate();
            const day = prevMonthDays - (startingDayIndex - i - 1);
            this.createDayElement(day, 'other-month');
        }
        
        // Add current month's days
        for (let day = 1; day <= totalDays; day++) {
            const isToday = today.getDate() === day && 
                           today.getMonth() === month && 
                           today.getFullYear() === year;
            
            const classes = isToday ? 'today' : '';
            this.createDayElement(day, classes);
        }
        
        // Add next month's days
        const totalCells = 42; // 6 rows × 7 days
        const remainingCells = totalCells - (startingDayIndex + totalDays);
        for (let day = 1; day <= remainingCells; day++) {
            this.createDayElement(day, 'other-month');
        }
    }

    createDayElement(day, classes = '') {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        if (classes) {
            dayElement.className = classes;
        }
        
        dayElement.addEventListener('click', () => this.handleDateClick(day));
        this.daysGrid.appendChild(dayElement);
    }

    handleDateClick(day) {
        // Remove previous selection
        const previousSelected = this.daysGrid.querySelector('.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add new selection
        const clickedDay = event.target;
        clickedDay.classList.add('selected');
        
        // Store selected date
        this.selectedDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );

        // You can add your custom handling here
        // For example, notify Telegram Web App
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify({
                selectedDate: this.selectedDate.toISOString()
            }));
        }
    }
} 