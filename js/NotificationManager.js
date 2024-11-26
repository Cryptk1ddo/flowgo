class NotificationManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.notifications = new Map();
        this.channels = {
            telegram: true,
            browser: true,
            sound: true,
            vibration: true
        };
        
        this.notificationSounds = {
            default: new Audio('/sounds/notification.mp3'),
            important: new Audio('/sounds/important.mp3'),
            reminder: new Audio('/sounds/reminder.mp3')
        };

        this.init();
    }

    async init() {
        // Request necessary permissions
        await this.requestPermissions();
        
        // Initialize notification channels
        this.initializeChannels();
        
        // Start notification scheduler
        this.startNotificationScheduler();
        
        // Register service worker for background notifications
        this.registerServiceWorker();
    }

    async requestPermissions() {
        try {
            // Browser notifications
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                this.channels.browser = permission === 'granted';
            }

            // Sound permissions
            if ('AudioContext' in window) {
                const audioContext = new AudioContext();
                await audioContext.resume();
                this.channels.sound = true;
            }

            // Vibration permissions
            if ('vibrate' in navigator) {
                this.channels.vibration = true;
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registered:', registration);
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }

    scheduleEventNotifications(event) {
        // Clear existing notifications for this event
        this.clearEventNotifications(event.id);

        // Calculate notification times based on reminders
        const notificationTimes = this.calculateNotificationTimes(event);

        notificationTimes.forEach(({ time, type }) => {
            if (time > Date.now()) {
                const timeoutId = setTimeout(() => {
                    this.triggerNotification(event, type);
                }, time - Date.now());

                this.notifications.set(`${event.id}-${type}`, {
                    timeoutId,
                    event,
                    type,
                    time
                });
            }
        });
    }

    calculateNotificationTimes(event) {
        const times = [];
        const startTime = event.startDate.getTime();

        // Add custom reminder times
        event.reminders.forEach(minutes => {
            times.push({
                time: startTime - (minutes * 60000),
                type: 'reminder'
            });
        });

        // Add smart reminders based on event type and travel time
        if (event.location) {
            const travelTime = this.estimateTravelTime(event.location);
            times.push({
                time: startTime - travelTime,
                type: 'travel'
            });
        }

        // Add priority-based notifications
        if (event.priority === 'high') {
            times.push({
                time: startTime - (24 * 60 * 60000), // 24 hours before
                type: 'important'
            });
        }

        return times;
    }

    async triggerNotification(event, type) {
        const notificationData = this.createNotificationData(event, type);

        // Trigger appropriate channels based on notification type and user preferences
        if (this.channels.telegram) {
            await this.sendTelegramNotification(notificationData);
        }

        if (this.channels.browser) {
            this.showBrowserNotification(notificationData);
        }

        if (this.channels.sound) {
            this.playNotificationSound(type);
        }

        if (this.channels.vibration) {
            this.triggerVibration(type);
        }
    }

    createNotificationData(event, type) {
        const timeUntilEvent = event.startDate.getTime() - Date.now();
        const timeFormatted = this.formatTimeUntil(timeUntilEvent);

        return {
            title: event.title,
            body: this.getNotificationBody(event, type, timeFormatted),
            icon: this.getNotificationIcon(type),
            data: {
                eventId: event.id,
                type: type,
                url: `/event/${event.id}`
            }
        };
    }

    getNotificationBody(event, type, timeFormatted) {
        const bodies = {
            reminder: `Starts in ${timeFormatted}`,
            travel: `Time to leave for "${event.title}". Estimated travel time: ${this.formatTravelTime(event.location)}`,
            important: `Important event "${event.title}" tomorrow`,
            default: `Event notification for "${event.title}"`
        };
        return bodies[type] || bodies.default;
    }

    async sendTelegramNotification(notificationData) {
        if (window.Telegram?.WebApp) {
            try {
                await window.Telegram.WebApp.showAlert(
                    `${notificationData.title}\n${notificationData.body}`
                );
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } catch (error) {
                console.error('Telegram notification failed:', error);
            }
        }
    }

    showBrowserNotification(notificationData) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(notificationData.title, {
                body: notificationData.body,
                icon: notificationData.icon,
                badge: '/icons/badge.png',
                tag: notificationData.data.eventId,
                data: notificationData.data,
                requireInteraction: true
            });

            notification.addEventListener('click', () => {
                this.handleNotificationClick(notificationData.data);
            });
        }
    }

    playNotificationSound(type) {
        const sound = this.notificationSounds[type] || this.notificationSounds.default;
        sound.play().catch(error => console.error('Sound playback failed:', error));
    }

    triggerVibration(type) {
        if ('vibrate' in navigator) {
            const patterns = {
                reminder: [200, 100, 200],
                important: [300, 100, 300, 100, 300],
                travel: [200, 100, 200, 100, 400],
                default: [200]
            };
            navigator.vibrate(patterns[type] || patterns.default);
        }
    }

    handleNotificationClick(data) {
        // Focus or open the app window
        if (window.focus) window.focus();
        
        // Navigate to the event
        window.location.href = data.url;
    }

    clearEventNotifications(eventId) {
        // Clear timeouts
        for (const [key, notification] of this.notifications.entries()) {
            if (notification.event.id === eventId) {
                clearTimeout(notification.timeoutId);
                this.notifications.delete(key);
            }
        }
    }

    // Utility methods
    formatTimeUntil(ms) {
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours`;
        const days = Math.floor(hours / 24);
        return `${days} days`;
    }
} 