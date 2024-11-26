class FocusMode {
    constructor(pomodoroTimer) {
        this.pomodoroTimer = pomodoroTimer;
        this.isActive = false;
        this.distractions = new Set();
        
        this.initializeFocusMode();
    }

    initializeFocusMode() {
        const focusButton = document.createElement('button');
        focusButton.className = 'focus-mode-btn';
        focusButton.innerHTML = `
            <span class="material-icons">do_not_disturb</span>
            <span>Focus Mode</span>
        `;
        
        focusButton.addEventListener('click', () => this.toggleFocusMode());
        this.pomodoroTimer.container.appendChild(focusButton);
    }

    async toggleFocusMode() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            await this.enableFocusMode();
        } else {
            this.disableFocusMode();
        }
    }

    async enableFocusMode() {
        // Request necessary permissions
        if ('Notification' in window) {
            await Notification.requestPermission();
        }

        // Enable do not disturb if available
        if ('setAppBadge' in navigator) {
            navigator.setAppBadge(0);
        }

        // Apply focus mode UI
        document.body.classList.add('focus-mode');
        
        // Track distractions
        this.startDistractionTracking();
        
        // Notify Telegram
        if (this.pomodoroTimer.telegram?.webapp) {
            this.pomodoroTimer.telegram.webapp.HapticFeedback.notificationOccurred('success');
        }
    }

    startDistractionTracking() {
        this.distractionTracker = (e) => {
            if (!this.isActive) return;
            
            if (e.type === 'visibilitychange' && document.hidden) {
                this.trackDistraction('Tab switched');
            } else if (e.type === 'blur') {
                this.trackDistraction('App switched');
            }
        };

        document.addEventListener('visibilitychange', this.distractionTracker);
        window.addEventListener('blur', this.distractionTracker);
    }

    trackDistraction(type) {
        const distraction = {
            type,
            timestamp: new Date(),
            sessionId: this.pomodoroTimer.currentSessionId
        };

        this.distractions.add(distraction);
        this.showDistractionNotification();
    }

    showDistractionNotification() {
        if (this.isActive && Notification.permission === 'granted') {
            new Notification('Stay Focused!', {
                body: 'Return to your task to maintain focus.',
                icon: '/icons/focus.png',
                silent: true
            });
        }
    }
} 