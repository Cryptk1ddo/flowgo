class EventManager {
    constructor(dataManager, calendarManager) {
        this.dataManager = dataManager;
        this.calendarManager = calendarManager;
        this.notifications = [];
        
        // Initialize notification permission
        this.initializeNotifications();
        
        // Check for upcoming events every minute
        setInterval(() => this.checkUpcomingEvents(), 60000);
    }

    async initializeNotifications() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        }
    }

    createEvent(eventData) {
        const event = new Event(
            null,
            eventData.title,
            eventData.description,
            eventData.startDate,
            eventData.endDate,
            eventData.category
        );

        this.dataManager.addEvent(event);
        this.scheduleNotification(event);
        this.calendarManager.renderCalendar();
        
        return event;
    }

    scheduleNotification(event) {
        // Clear existing notifications for this event
        this.clearEventNotifications(event.id);
        
        const now = Date.now();
        const eventTime = event.startDate.getTime();
        
        // Only schedule if event is in the future
        if (eventTime <= now) return;
        
        // Use single timeout for nearest notification
        const times = [5 * 60000, 60 * 60000, 24 * 60 * 60000]
            .map(t => eventTime - t)
            .filter(t => t > now)
            .sort((a, b) => a - b);
        
        if (times.length) {
            const timeoutId = setTimeout(() => {
                this.showNotification(event);
                this.scheduleNotification(event); // Reschedule next notification
            }, times[0] - now);
            
            this.notifications.push({ eventId: event.id, timeoutId });
        }
    }

    showNotification(event, timeMessage) {
        const notificationText = `${event.title} starts in ${timeMessage}`;
        this.telegram?.showAlert(notificationText);
    }

    checkUpcomingEvents() {
        const now = new Date();
        const events = Array.from(this.dataManager.events.values());
        
        events.forEach(event => {
            const timeDiff = event.startDate.getTime() - now.getTime();
            if (timeDiff > 0 && timeDiff <= 5 * 60 * 1000) { // Within next 5 minutes
                this.showNotification(event, 'soon');
            }
        });
    }

    async deleteEvent(eventId) {
        if (await this.telegram?.showConfirm('Are you sure you want to delete this event?')) {
            // Clear any pending notifications
            this.notifications = this.notifications.filter(notification => {
                if (notification.eventId === eventId) {
                    clearTimeout(notification.timeoutId);
                    return false;
                }
                return true;
            });

            this.dataManager.events.delete(eventId);
            this.dataManager.saveData();
            this.calendarManager.renderCalendar();
        }
    }

    updateEvent(eventId, updateData) {
        const event = this.dataManager.events.get(eventId);
        if (!event) return null;

        // Update event properties
        Object.assign(event, updateData);
        
        // Reschedule notifications
        this.notifications
            .filter(n => n.eventId === eventId)
            .forEach(n => clearTimeout(n.timeoutId));
            
        this.scheduleNotification(event);
        
        this.dataManager.saveData();
        this.calendarManager.renderCalendar();
        
        return event;
    }

    handleEventSubmit(form, existingEvent = null) {
        const formData = new FormData(form);
        const reminders = Array.from(form.querySelectorAll('.reminder-options input:checked'))
            .map(input => parseInt(input.value));
        
        const eventData = {
            title: formData.get('eventTitle'),
            description: formData.get('eventDescription'),
            startDate: new Date(formData.get('eventStart')),
            endDate: new Date(formData.get('eventEnd')),
            category: formData.get('eventCategory'),
            isAllDay: formData.get('allDay') === 'on',
            reminders: reminders,
            recurrence: formData.get('recurrence') || null
        };

        if (existingEvent) {
            this.updateEvent(existingEvent.id, eventData);
        } else {
            this.createEvent(eventData);
        }

        // Schedule reminders
        this.scheduleEventReminders(eventData);
    }

    scheduleEventReminders(event) {
        // Clear existing reminders
        this.clearEventNotifications(event.id);
        
        event.reminders.forEach(minutes => {
            const reminderTime = new Date(event.startDate.getTime() - (minutes * 60000));
            if (reminderTime > new Date()) {
                const timeoutId = setTimeout(() => {
                    this.showNotification(event, `${event.title} starts in ${this.formatReminderTime(minutes)}`);
                }, reminderTime.getTime() - Date.now());
                
                this.notifications.push({ eventId: event.id, timeoutId });
            }
        });
    }

    formatReminderTime(minutes) {
        if (minutes === 1440) return '1 day';
        if (minutes === 60) return '1 hour';
        return `${minutes} minutes`;
    }

    showNotification(event, message) {
        if (this.telegram?.webapp) {
            this.telegram.webapp.showAlert(message);
            this.telegram.webapp.HapticFeedback.notificationOccurred('success');
        } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(event.title, {
                body: message,
                icon: '/icon.png'
            });
        }
    }
}