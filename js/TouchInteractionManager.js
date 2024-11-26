class TouchInteractionManager {
    constructor(app) {
        this.app = app;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.initialScrollTop = 0;
        this.swipeThreshold = 50;
        this.longPressDelay = 500;
        this.hapticFeedback = new HapticFeedbackManager();
        
        this.initializeInteractions();
    }

    initializeInteractions() {
        this.initializeSwipeGestures();
        this.initializePullToRefresh();
        this.initializeLongPress();
        this.initializePinchZoom();
        this.initializeDoubleTap();
        this.initializeDragToReorder();
    }

    initializeSwipeGestures() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.initialScrollTop = window.scrollY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.touchStartX) return;

            const deltaX = e.touches[0].clientX - this.touchStartX;
            const deltaY = e.touches[0].clientY - this.touchStartY;

            // If horizontal swipe is greater than vertical, prevent scrolling
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
                this.handleSwipe(deltaX);
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            this.touchStartX = null;
            this.touchStartY = null;
        });
    }

    handleSwipe(deltaX) {
        const swipeableElements = document.querySelectorAll('.swipeable');
        swipeableElements.forEach(element => {
            const transform = Math.max(-100, Math.min(0, deltaX));
            element.style.transform = `translateX(${transform}px)`;

            if (Math.abs(deltaX) > this.swipeThreshold) {
                this.hapticFeedback.trigger('light');
            }
        });
    }

    initializePullToRefresh() {
        const refreshContainer = document.querySelector('.refresh-container');
        let isPulling = false;
        let pullStartY = 0;

        refreshContainer.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                isPulling = true;
                pullStartY = e.touches[0].clientY;
            }
        });

        refreshContainer.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            const pullDistance = e.touches[0].clientY - pullStartY;
            if (pullDistance > 0) {
                refreshContainer.style.transform = `translateY(${Math.min(pullDistance * 0.5, 100)}px)`;
                
                if (pullDistance > 70) {
                    this.hapticFeedback.trigger('medium');
                }
            }
        });

        refreshContainer.addEventListener('touchend', () => {
            if (isPulling) {
                refreshContainer.style.transform = '';
                isPulling = false;
            }
        });
    }

    initializeLongPress() {
        let longPressTimer;
        let isLongPress = false;

        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.long-pressable');
            if (!target) return;

            longPressTimer = setTimeout(() => {
                isLongPress = true;
                this.hapticFeedback.trigger('heavy');
                this.handleLongPress(target);
            }, this.longPressDelay);
        });

        document.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
            isLongPress = false;
        });

        document.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    handleLongPress(element) {
        const contextMenu = this.createContextMenu(element);
        document.body.appendChild(contextMenu);
        
        requestAnimationFrame(() => {
            contextMenu.classList.add('show');
        });
    }

    initializePinchZoom() {
        let initialDistance = 0;
        let currentScale = 1;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                if (Math.abs(scale - currentScale) > 0.1) {
                    this.hapticFeedback.trigger('light');
                    currentScale = scale;
                }
            }
        });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.hypot(dx, dy);
    }

    initializeDoubleTap() {
        let lastTap = 0;
        const doubleTapDelay = 300;

        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            const target = e.target.closest('.double-tappable');

            if (tapLength < doubleTapDelay && tapLength > 0 && target) {
                this.hapticFeedback.trigger('medium');
                this.handleDoubleTap(target);
            }
            lastTap = currentTime;
        });
    }

    initializeDragToReorder() {
        const draggableList = document.querySelector('.draggable-list');
        if (!draggableList) return;

        let draggedItem = null;
        let placeholder = null;
        let initialY = 0;

        draggableList.addEventListener('touchstart', (e) => {
            const item = e.target.closest('.draggable-item');
            if (!item) return;

            draggedItem = item;
            initialY = e.touches[0].clientY;
            
            // Create placeholder
            placeholder = item.cloneNode(true);
            placeholder.classList.add('placeholder');
            
            // Style dragged item
            draggedItem.classList.add('dragging');
            draggedItem.style.position = 'fixed';
            draggedItem.style.top = `${initialY}px`;
            
            this.hapticFeedback.trigger('medium');
        });

        draggableList.addEventListener('touchmove', (e) => {
            if (!draggedItem) return;

            const currentY = e.touches[0].clientY;
            const deltaY = currentY - initialY;
            
            draggedItem.style.transform = `translateY(${deltaY}px)`;
            
            // Find and swap with closest item
            const closestItem = this.findClosestItem(currentY, draggableList);
            if (closestItem && closestItem !== placeholder) {
                this.hapticFeedback.trigger('light');
                draggableList.insertBefore(placeholder, closestItem);
            }
        });

        draggableList.addEventListener('touchend', () => {
            if (!draggedItem) return;

            draggedItem.classList.remove('dragging');
            draggedItem.style.position = '';
            draggedItem.style.transform = '';
            
            draggableList.insertBefore(draggedItem, placeholder);
            placeholder.remove();
            
            this.hapticFeedback.trigger('medium');
            draggedItem = null;
            placeholder = null;
        });
    }

    findClosestItem(y, container) {
        const items = [...container.children].filter(child => 
            !child.classList.contains('dragging') && 
            !child.classList.contains('placeholder')
        );

        return items.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
} 