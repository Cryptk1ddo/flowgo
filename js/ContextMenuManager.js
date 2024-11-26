class ContextMenuManager {
    constructor() {
        this.activeMenu = null;
        this.haptics = new HapticFeedbackManager();
        this.initializeContextMenus();
    }

    initializeContextMenus() {
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('touchstart', this.handleLongPress.bind(this));
        document.addEventListener('touchend', () => this.clearLongPressTimer());
    }

    handleLongPress(e) {
        const target = e.target.closest('[data-context-menu]');
        if (!target) return;

        this.longPressTimer = setTimeout(() => {
            this.haptics.trigger('medium');
            this.showContextMenu(target, e.touches[0]);
        }, 500);

        // Prevent scroll during long press
        target.addEventListener('touchmove', () => this.clearLongPressTimer(), { once: true });
    }

    showContextMenu(target, touch) {
        const menuId = target.dataset.contextMenu;
        const menuTemplate = this.getMenuTemplate(menuId, target);
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = menuTemplate;

        // Position menu
        const { clientX: x, clientY: y } = touch;
        this.positionMenu(menu, x, y);

        document.body.appendChild(menu);
        this.activeMenu = menu;

        // Animate menu
        requestAnimationFrame(() => menu.classList.add('show'));

        // Add backdrop
        this.addBackdrop();
    }

    positionMenu(menu, x, y) {
        const rect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let left = x;
        let top = y;

        // Adjust position if menu would go off screen
        if (left + rect.width > windowWidth) {
            left = windowWidth - rect.width - 10;
        }
        if (top + rect.height > windowHeight) {
            top = windowHeight - rect.height - 10;
        }

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    }

    addBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.className = 'context-menu-backdrop';
        backdrop.addEventListener('click', () => this.hideContextMenu());
        document.body.appendChild(backdrop);
    }

    hideContextMenu() {
        if (!this.activeMenu) return;

        this.activeMenu.classList.remove('show');
        document.querySelector('.context-menu-backdrop')?.remove();

        setTimeout(() => {
            this.activeMenu.remove();
            this.activeMenu = null;
        }, 200);
    }

    clearLongPressTimer() {
        clearTimeout(this.longPressTimer);
    }
} 