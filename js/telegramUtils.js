class TelegramUtils {
    constructor() {
        this.webapp = window.Telegram?.WebApp;
        this.init();
    }

    init() {
        if (!this.webapp) {
            console.warn('Telegram WebApp is not available');
            return;
        }

        // Enable closing confirmation
        this.webapp.enableClosingConfirmation();

        // Initialize viewport settings
        this.initializeViewport();

        // Setup event listeners
        this.setupEventListeners();

        // Set initial theme
        this.applyTheme();
    }

    initializeViewport() {
        if (!this.webapp) return;

        // Set viewport settings
        this.webapp.setViewportSettings({
            rotate: true,
            can_rotate: true
        });

        // Expand to full height
        this.webapp.expand();
    }

    setupEventListeners() {
        if (!this.webapp) return;

        // Handle theme changes
        this.webapp.onEvent('themeChanged', () => {
            this.applyTheme();
        });

        // Handle viewport changes
        this.webapp.onEvent('viewportChanged', (event) => {
            this.handleViewportChange(event);
        });
    }

    applyTheme() {
        if (!this.webapp) return;

        const colorScheme = this.webapp.colorScheme;
        document.documentElement.setAttribute('data-theme', colorScheme);

        // Apply Telegram theme colors
        document.documentElement.style.setProperty('--tg-theme-bg-color', this.webapp.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', this.webapp.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', this.webapp.themeParams.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', this.webapp.themeParams.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', this.webapp.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', this.webapp.themeParams.button_text_color);
    }

    handleViewportChange(event) {
        // Update layout based on viewport changes
        const isExpanded = this.webapp.isExpanded;
        document.body.classList.toggle('expanded', isExpanded);
    }

    showAlert(message) {
        if (this.webapp) {
            this.webapp.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message) {
        if (this.webapp) {
            return this.webapp.showConfirm(message);
        }
        return confirm(message);
    }

    hapticFeedback(type) {
        if (this.webapp?.HapticFeedback) {
            this.webapp.HapticFeedback.impactOccurred(type);
        }
    }
} 