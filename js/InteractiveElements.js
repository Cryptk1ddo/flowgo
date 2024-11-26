class InteractiveElements {
    constructor() {
        this.initializeRippleEffect();
        this.initializeSwipeActions();
        this.initializePullToRefresh();
        this.initializeHapticFeedback();
    }

    initializeRippleEffect() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.tg-list-item, .tg-button');
            if (!target) return;

            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            target.appendChild(ripple);

            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            ripple.addEventListener('animationend', () => ripple.remove());
        });
    }

    initializeSwipeActions() {
        const items = document.querySelectorAll('.tg-list-item');
        let startX, currentX, isDragging;

        items.forEach(item => {
            item.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                item.style.transition = 'none';
            });

            item.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                if (Math.abs(diff) < 100) {
                    item.style.transform = `translateX(${diff}px)`;
                }
            });

            item.addEventListener('touchend', () => {
                isDragging = false;
                item.style.transition = 'transform 0.3s ease';
                item.style.transform = 'translateX(0)';
            });
        });
    }

    initializePullToRefresh() {
        let startY, currentY;
        const threshold = 80;
        const container = document.querySelector('.tg-list');
        const refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'refresh-indicator';

        container.addEventListener('touchstart', (e) => {
            if (container.scrollTop === 0) {
                startY = e.touches[0].clientY;
            }
        });

        container.addEventListener('touchmove', (e) => {
            if (!startY) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 0 && diff < threshold) {
                container.style.transform = `translateY(${diff}px)`;
                refreshIndicator.style.opacity = diff / threshold;
            }
        });

        container.addEventListener('touchend', () => {
            if (currentY - startY > threshold) {
                this.triggerRefresh();
            }
            container.style.transform = 'translateY(0)';
            startY = null;
            currentY = null;
        });
    }

    initializeHapticFeedback() {
        const buttons = document.querySelectorAll('.tg-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (window.Telegram?.WebApp) {
                    Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
            });
        });
    }

    triggerRefresh() {
        // Implement your refresh logic here
        console.log('Refreshing...');
    }
} 