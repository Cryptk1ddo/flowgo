class CalendarManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentView = 'month'; // 'day', 'week', 'month'
        this.telegram = window.telegram; // Access the global telegram instance
        // ... existing constructor code ...

        this.initializeViewControls();
        this.eventManager = new EventManager(dataManager, this);
        this.initializeEventHandling();
    }

    initializeViewControls() {
        const viewControls = document.createElement('div');
        viewControls.className = 'view-controls';
        viewControls.innerHTML = `
            <button data-view="day">Day</button>
            <button data-view="week">Week</button>
            <button data-view="month">Month</button>
        `;
        
        this.monthYearElement.parentNode.insertBefore(viewControls, this.monthYearElement);
        
        viewControls.addEventListener('click', (e) => {
            if (e.target.dataset.view) {
                this.switchView(e.target.dataset.view);
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        this.renderCalendar();
    }

    handleDateClick(day) {
        this.telegram?.hapticFeedback('medium');
        // ... existing code ...

        // Show event creation dialog
        this.showEventDialog(this.selectedDate);
    }

    showEventDialog(existingEvent = null) {
        const dialog = document.createElement('div');
        dialog.className = 'event-dialog';
        
        const formattedDate = this.selectedDate?.toISOString().slice(0, 16) || 
                             new Date().toISOString().slice(0, 16);

        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>${existingEvent ? 'Edit Event' : 'New Event'}</h3>
                <form id="eventForm">
                    <input type="text" id="eventTitle" placeholder="Event Title" 
                           value="${existingEvent?.title || ''}" required>
                    <textarea id="eventDescription" placeholder="Description">${existingEvent?.description || ''}</textarea>
                    
                    <div class="datetime-group">
                        <label class="all-day-toggle">
                            <input type="checkbox" id="allDay" 
                                   ${existingEvent?.isAllDay ? 'checked' : ''}>
                            All Day
                        </label>
                        <div>
                            <label>Start</label>
                            <input type="datetime-local" id="eventStart" 
                                   value="${existingEvent?.startDate.toISOString().slice(0, 16) || formattedDate}" required>
                        </div>
                        <div>
                            <label>End</label>
                            <input type="datetime-local" id="eventEnd" 
                                   value="${existingEvent?.endDate.toISOString().slice(0, 16) || formattedDate}" required>
                        </div>
                    </div>

                    <div class="reminder-section">
                        <label>Reminders</label>
                        <div class="reminder-options">
                            <label><input type="checkbox" value="1440" ${existingEvent?.reminders?.includes(1440) ? 'checked' : ''}> 1 day before</label>
                            <label><input type="checkbox" value="60" ${existingEvent?.reminders?.includes(60) ? 'checked' : ''}> 1 hour before</label>
                            <label><input type="checkbox" value="5" ${existingEvent?.reminders?.includes(5) ? 'checked' : ''}> 5 minutes before</label>
                        </div>
                    </div>

                    <div class="recurrence-section">
                        <label>Repeat</label>
                        <select id="recurrence">
                            <option value="">Never</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div class="category-group">
                        <label>Category</label>
                        <select id="eventCategory">
                            <option value="default">Default</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="important">Important</option>
                        </select>
                    </div>

                    <div class="dialog-buttons">
                        ${existingEvent ? '<button type="button" id="deleteEvent" class="danger-btn">Delete</button>' : ''}
                        <button type="button" id="cancelEvent">Cancel</button>
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        `;

        // Add corresponding CSS for new elements
        const style = document.createElement('style');
        style.textContent = `
            .reminder-section, .recurrence-section {
                margin: 16px 0;
            }
            .reminder-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .all-day-toggle {
                margin-bottom: 12px;
                display: block;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(dialog);
        this.setupEventDialogHandlers(dialog, existingEvent);
    }

    initializeEventHandling() {
        // Add event creation button
        const addEventBtn = document.createElement('button');
        addEventBtn.className = 'nav-btn';
        addEventBtn.textContent = '+';
        addEventBtn.onclick = () => this.showEventDialog();
        
        this.monthYearElement.parentNode.appendChild(addEventBtn);
    }

    createDayElement(day, classes = '') {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        if (classes) {
            dayElement.className = classes;
        }

        // Add events for this day
        const currentDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            day
        );

        const events = Array.from(this.dataManager.events.values())
            .filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.getDate() === day &&
                       eventDate.getMonth() === currentDate.getMonth() &&
                       eventDate.getFullYear() === currentDate.getFullYear();
            });

        if (events.length > 0) {
            const eventIndicator = document.createElement('div');
            eventIndicator.className = 'event-indicator';
            eventIndicator.textContent = events.length;
            dayElement.appendChild(eventIndicator);
        }

        dayElement.addEventListener('click', () => {
            this.handleDateClick(day);
            if (events.length > 0) {
                this.showEventsList(events);
            }
        });

        this.daysGrid.appendChild(dayElement);
    }

    showEventsList(events) {
        const dialog = document.createElement('div');
        dialog.className = 'event-dialog';
        
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Events</h3>
                <div class="events-list">
                    ${events.map(event => `
                        <div class="event-item ${event.category}" onclick="handleEventClick('${event.id}')">
                            <h4>${event.title}</h4>
                            <p>${event.startDate.toLocaleTimeString()}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="dialog-buttons">
                    <button onclick="this.closest('.event-dialog').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    renderCalendar() {
        switch (this.currentView) {
            case 'month':
                this.renderMonthView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'day':
                this.renderDayView();
                break;
            case 'agenda':
                this.renderAgendaView();
                break;
        }
        
        // Update mini calendar
        this.updateMiniCalendar();
        
        // Fetch and display weather if in day or week view
        if (['day', 'week'].includes(this.currentView)) {
            this.fetchWeatherData();
        }
    }

    renderMonthView() {
        const grid = this.container.querySelector('.calendar-grid');
        grid.innerHTML = '';
        
        const { year, month } = this.getMonthData();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Create week headers
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekDays.forEach(day => {
            const header = document.createElement('div');
            header.className = 'week-header';
            header.textContent = day;
            grid.appendChild(header);
        });

        // Fill in the days
        let currentDate = new Date(firstDay);
        currentDate.setDate(currentDate.getDate() - firstDay.getDay()); // Start from last month if needed

        for (let i = 0; i < 42; i++) {
            const dayCell = this.createDayCell(currentDate);
            grid.appendChild(dayCell);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    createDayCell(date) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        
        // Add appropriate classes
        if (this.isToday(date)) cell.classList.add('today');
        if (date.getMonth() !== this.selectedDate.getMonth()) cell.classList.add('other-month');
        
        // Add date number
        const dateNumber = document.createElement('div');
        dateNumber.className = 'date-number';
        dateNumber.textContent = date.getDate();
        cell.appendChild(dateNumber);

        // Add events for this day
        const events = this.getEventsForDate(date);
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';
        
        events.forEach(event => {
            const eventElement = this.createEventElement(event);
            eventsContainer.appendChild(eventElement);
        });
        
        cell.appendChild(eventsContainer);
        
        // Add weather indicator if available
        const weather = this.weatherData?.get(date.toDateString());
        if (weather) {
            const weatherIndicator = this.createWeatherIndicator(weather);
            cell.appendChild(weatherIndicator);
        }

        return cell;
    }

    createEventElement(event) {
        const element = document.createElement('div');
        element.className = `event-pill ${event.category}`;
        element.dataset.eventId = event.id;
        element.draggable = true;
        
        element.innerHTML = `
            <span class="event-time">${this.formatEventTime(event)}</span>
            <span class="event-title">${event.title}</span>
        `;
        
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEventDialog(event);
        });

        return element;
    }

    // Weather integration
    async fetchWeatherData() {
        const apiKey = 'YOUR_WEATHER_API_KEY';
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${this.userLocation}&days=7`
            );
            const data = await response.json();
            this.processWeatherData(data);
        } catch (error) {
            console.error('Weather fetch failed:', error);
        }
    }

    processWeatherData(data) {
        this.weatherData = new Map();
        data.forecast.forecastday.forEach(day => {
            this.weatherData.set(new Date(day.date).toDateString(), {
                temp: day.day.avgtemp_c,
                condition: day.day.condition.text,
                icon: day.day.condition.icon
            });
        });
        this.renderCalendar();
    }

    createWeatherIndicator(weather) {
        const indicator = document.createElement('div');
        indicator.className = 'weather-indicator';
        indicator.innerHTML = `
            <img src="${weather.icon}" alt="${weather.condition}">
            <span>${weather.temp}°C</span>
        `;
        return indicator;
    }

    // Mini Calendar
    createMiniCalendar() {
        const miniCalendar = document.createElement('div');
        miniCalendar.className = 'mini-calendar';
        
        const today = new Date();
        const currentMonth = new Date(this.selectedDate);
        
        // Add month/year header
        miniCalendar.innerHTML = `
            <div class="mini-calendar-header">
                <button class="mini-prev">←</button>
                <span>${currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                <button class="mini-next">→</button>
            </div>
        `;

        // Add days
        const days = this.generateMiniCalendarDays(currentMonth);
        miniCalendar.appendChild(days);

        return miniCalendar;
    }

    generateMiniCalendarDays(date) {
        const container = document.createElement('div');
        container.className = 'mini-calendar-days';
        
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // Add day headers
        'SMTWTFS'.split('').forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'mini-day-header';
            dayHeader.textContent = day;
            container.appendChild(dayHeader);
        });

        // Fill in the days
        let currentDate = new Date(firstDay);
        currentDate.setDate(currentDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'mini-day';
            dayElement.textContent = currentDate.getDate();
            
            if (this.isToday(currentDate)) dayElement.classList.add('today');
            if (currentDate.getMonth() !== date.getMonth()) dayElement.classList.add('other-month');
            if (this.isSameDate(currentDate, this.selectedDate)) dayElement.classList.add('selected');
            
            dayElement.addEventListener('click', () => {
                this.selectedDate = new Date(currentDate);
                this.renderCalendar();
            });
            
            container.appendChild(dayElement);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return container;
    }

    // Utility methods
    isToday(date) {
        const today = new Date();
        return this.isSameDate(date, today);
    }

    isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    formatEventTime(event) {
        if (event.isAllDay) return 'All Day';
        return event.startDate.toLocaleTimeString('default', { 
            hour: 'numeric', 
            minute: '2-digit'
        });
    }

    setupEventListeners() {
        // Navigation controls
        this.container.querySelector('.today-btn').addEventListener('click', () => this.goToToday());
        this.container.querySelector('.prev-btn').addEventListener('click', () => this.navigate(-1));
        this.container.querySelector('.next-btn').addEventListener('click', () => this.navigate(1));
        
        // View controls
        this.container.querySelector('.view-controls').addEventListener('click', (e) => {
            const viewBtn = e.target.closest('[data-view]');
            if (viewBtn) this.switchView(viewBtn.dataset.view);
        });

        // Add event button
        this.container.querySelector('.add-btn').addEventListener('click', () => this.showEventDialog());

        // Search shortcut (Ctrl/Cmd + F)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.showSearch();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    enableDragAndDrop() {
        this.container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('event-pill')) {
                this.draggedEvent = this.dataManager.getEvent(e.target.dataset.eventId);
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.eventId);
            }
        });

        this.container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('event-pill')) {
                e.target.classList.remove('dragging');
                this.draggedEvent = null;
            }
        });

        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dayCell = e.target.closest('.calendar-day');
            if (dayCell) {
                const dropIndicator = this.createDropIndicator(e.clientY, dayCell);
                dayCell.appendChild(dropIndicator);
            }
        });

        this.container.addEventListener('drop', (e) => {
            e.preventDefault();
            const dayCell = e.target.closest('.calendar-day');
            if (dayCell && this.draggedEvent) {
                const newDate = this.getDateFromCell(dayCell);
                this.updateEventDate(this.draggedEvent, newDate);
            }
        });
    }

    createDropIndicator(clientY, cell) {
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        
        // Calculate position within the cell
        const cellRect = cell.getBoundingClientRect();
        const relativeY = clientY - cellRect.top;
        const timeSlot = Math.floor(relativeY / (cellRect.height / 24));
        
        indicator.style.top = `${(timeSlot * (100 / 24))}%`;
        return indicator;
    }

    showSearch() {
        const searchDialog = document.createElement('div');
        searchDialog.className = 'search-dialog';
        searchDialog.innerHTML = `
            <div class="search-container">
                <input type="text" placeholder="Search events..." class="search-input" autofocus>
                <div class="search-results"></div>
            </div>
        `;

        const input = searchDialog.querySelector('.search-input');
        const results = searchDialog.querySelector('.search-results');

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            const matches = this.searchEvents(query);
            this.renderSearchResults(matches, results);
        });

        document.body.appendChild(searchDialog);
    }

    searchEvents(query) {
        return Array.from(this.dataManager.events.values()).filter(event => 
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query)
        );
    }

    renderSearchResults(events, container) {
        container.innerHTML = events.map(event => `
            <div class="search-result" data-event-id="${event.id}">
                <div class="result-title">${event.title}</div>
                <div class="result-date">${event.startDate.toLocaleString()}</div>
            </div>
        `).join('');

        container.addEventListener('click', (e) => {
            const result = e.target.closest('.search-result');
            if (result) {
                const event = this.dataManager.getEvent(result.dataset.eventId);
                this.goToEvent(event);
            }
        });
    }

    goToEvent(event) {
        this.selectedDate = event.startDate;
        this.renderCalendar();
        this.highlightEvent(event.id);
    }

    highlightEvent(eventId) {
        const eventElement = this.container.querySelector(`[data-event-id="${eventId}"]`);
        if (eventElement) {
            eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            eventElement.classList.add('highlighted');
            setTimeout(() => eventElement.classList.remove('highlighted'), 2000);
        }
    }

    handleKeyboardNavigation(e) {
        const keys = {
            'ArrowLeft': () => this.navigate(-1),
            'ArrowRight': () => this.navigate(1),
            'ArrowUp': () => this.navigateWeek(-1),
            'ArrowDown': () => this.navigateWeek(1),
            't': () => this.goToToday(),
            'd': () => this.switchView('day'),
            'w': () => this.switchView('week'),
            'm': () => this.switchView('month'),
            'a': () => this.switchView('agenda')
        };

        if (e.target.tagName !== 'INPUT' && keys[e.key]) {
            e.preventDefault();
            keys[e.key]();
        }
    }

    renderWeekView() {
        const grid = this.container.querySelector('.calendar-grid');
        grid.className = 'calendar-grid week-view';
        grid.innerHTML = '';

        // Create time column
        const timeColumn = this.createTimeColumn();
        grid.appendChild(timeColumn);

        // Create day columns
        const weekStart = this.getWeekStart(this.selectedDate);
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);
            const dayColumn = this.createDayColumn(currentDate);
            grid.appendChild(dayColumn);
        }

        // Render current time indicator
        this.renderCurrentTimeIndicator();
    }

    renderDayView() {
        const grid = this.container.querySelector('.calendar-grid');
        grid.className = 'calendar-grid day-view';
        grid.innerHTML = '';

        // Create time column
        const timeColumn = this.createTimeColumn();
        grid.appendChild(timeColumn);

        // Create single day column
        const dayColumn = this.createDayColumn(this.selectedDate);
        grid.appendChild(dayColumn);

        // Render current time indicator
        this.renderCurrentTimeIndicator();
    }

    createTimeColumn() {
        const column = document.createElement('div');
        column.className = 'time-column';

        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            column.appendChild(timeSlot);
        }

        return column;
    }

    createDayColumn(date) {
        const column = document.createElement('div');
        column.className = 'day-column';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'day-header';
        header.innerHTML = `
            <div class="day-name">${date.toLocaleDateString('default', { weekday: 'short' })}</div>
            <div class="day-number">${date.getDate()}</div>
        `;
        column.appendChild(header);

        // Add time grid
        const timeGrid = document.createElement('div');
        timeGrid.className = 'time-grid';

        // Create slots for each hour
        for (let hour = 0; hour < 24; hour++) {
            const hourSlot = document.createElement('div');
            hourSlot.className = 'hour-slot';
            timeGrid.appendChild(hourSlot);
        }

        // Render events for this day
        const events = this.getEventsForDate(date);
        events.forEach(event => {
            const eventElement = this.createDetailedEventElement(event);
            timeGrid.appendChild(eventElement);
        });

        column.appendChild(timeGrid);
        return column;
    }

    createDetailedEventElement(event) {
        const startHour = event.startDate.getHours() + (event.startDate.getMinutes() / 60);
        const endHour = event.endDate.getHours() + (event.endDate.getMinutes() / 60);
        const duration = endHour - startHour;

        const element = document.createElement('div');
        element.className = `detailed-event ${event.category}`;
        element.style.top = `${(startHour / 24) * 100}%`;
        element.style.height = `${(duration / 24) * 100}%`;
        
        element.innerHTML = `
            <div class="event-time">${this.formatEventTime(event)}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-location">${event.location || ''}</div>
        `;

        // Add resize handles
        if (!event.isAllDay) {
            const topHandle = document.createElement('div');
            topHandle.className = 'resize-handle top';
            const bottomHandle = document.createElement('div');
            bottomHandle.className = 'resize-handle bottom';
            
            element.appendChild(topHandle);
            element.appendChild(bottomHandle);
        }

        this.makeEventResizable(element, event);
        return element;
    }

    makeEventResizable(element, event) {
        let startY, originalTop, originalHeight;
        const handles = element.querySelectorAll('.resize-handle');

        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                startY = e.clientY;
                originalTop = parseInt(element.style.top);
                originalHeight = parseInt(element.style.height);

                const moveHandler = (e) => {
                    const deltaY = e.clientY - startY;
                    if (handle.classList.contains('top')) {
                        const newTop = originalTop + deltaY;
                        const newHeight = originalHeight - deltaY;
                        if (newHeight > 0) {
                            element.style.top = `${newTop}%`;
                            element.style.height = `${newHeight}%`;
                        }
                    } else {
                        const newHeight = originalHeight + deltaY;
                        if (newHeight > 0) {
                            element.style.height = `${newHeight}%`;
                        }
                    }
                };

                const upHandler = () => {
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
                    this.updateEventTimes(event, element);
                };

                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
            });
        });
    }

    // Recurring Events
    createRecurringEvents(event) {
        if (!event.recurrence) return [event];

        const events = [];
        let currentDate = new Date(event.startDate);
        const endDate = event.recurrence.until || this.addMonths(currentDate, 12);

        while (currentDate <= endDate) {
            const newEvent = {...event};
            newEvent.id = crypto.randomUUID();
            newEvent.startDate = new Date(currentDate);
            newEvent.endDate = new Date(currentDate.setHours(
                event.endDate.getHours(),
                event.endDate.getMinutes()
            ));

            events.push(newEvent);

            // Calculate next occurrence
            switch (event.recurrence.frequency) {
                case 'daily':
                    currentDate.setDate(currentDate.getDate() + event.recurrence.interval);
                    break;
                case 'weekly':
                    currentDate.setDate(currentDate.getDate() + (7 * event.recurrence.interval));
                    break;
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + event.recurrence.interval);
                    break;
                case 'yearly':
                    currentDate.setFullYear(currentDate.getFullYear() + event.recurrence.interval);
                    break;
            }
        }

        return events;
    }

    // Calendar Export/Import
    exportCalendar() {
        const events = Array.from(this.dataManager.events.values());
        const icsData = this.generateICS(events);
        
        const blob = new Blob([icsData], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'calendar.ics';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    generateICS(events) {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Your Calendar App//EN'
        ];

        events.forEach(event => {
            icsContent = icsContent.concat([
                'BEGIN:VEVENT',
                `UID:${event.id}`,
                `DTSTAMP:${this.formatDateToICS(new Date())}`,
                `DTSTART:${this.formatDateToICS(event.startDate)}`,
                `DTEND:${this.formatDateToICS(event.endDate)}`,
                `SUMMARY:${event.title}`,
                `DESCRIPTION:${event.description || ''}`,
                'END:VEVENT'
            ]);
        });

        icsContent.push('END:VCALENDAR');
        return icsContent.join('\r\n');
    }

    formatDateToICS(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
} 