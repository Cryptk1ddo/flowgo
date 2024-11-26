class HapticFeedbackManager {
    constructor() {
        this.telegram = window.Telegram?.WebApp;
        this.patterns = {
            light: { intensity: 'light', duration: 'short' },
            medium: { intensity: 'medium', duration: 'medium' },
            heavy: { intensity: 'heavy', duration: 'long' },
            success: { type: 'success' },
            warning: { type: 'warning' },
            error: { type: 'error' }
        };
    }

    trigger(pattern, options = {}) {
        if (!this.telegram) return;

        const feedback = this.patterns[pattern] || this.patterns.medium;
        
        if (feedback.type) {
            this.telegram.HapticFeedback.notificationOccurred(feedback.type);
        } else {
            this.telegram.HapticFeedback.impactOccurred(feedback.intensity);
        }

        if (options.vibrate && navigator.vibrate) {
            navigator.vibrate(this.getDuration(feedback.duration));
        }
    }

    getDuration(type) {
        const durations = {
            short: 10,
            medium: 20,
            long: 30
        };
        return durations[type] || 20;
    }

    // Predefined haptic patterns
    taskComplete() {
        this.trigger('success', { vibrate: true });
    }

    timerTick() {
        this.trigger('light');
    }

    dragStart() {
        this.trigger('medium');
    }

    dragEnd() {
        this.trigger('light');
    }

    error() {
        this.trigger('error', { vibrate: true });
    }
} 