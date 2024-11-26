class TouchDragManager {
    constructor(app) {
        this.app = app;
        this.draggedElement = null;
        this.initialY = 0;
        this.initialX = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.draggedTask = null;
        this.placeholder = null;
        this.scrollTimeout = null;
        
        this.initializeTouchDrag();
    }

    initializeTouchDrag() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Initialize auto-scroll zones
        this.setupScrollZones();
    }

    handleTouchStart(e) {
        const taskElement = e.target.closest('.task-item');
        if (!taskElement) return;

        e.preventDefault();
        this.draggedElement = taskElement;
        this.draggedTask = {
            id: taskElement.dataset.taskId,
            listId: taskElement.closest('.task-list').dataset.listId
        };

        // Create visual feedback
        this.createDragFeedback(taskElement, e.touches[0]);

        // Store initial touch position
        this.initialX = e.touches[0].clientX - this.xOffset;
        this.initialY = e.touches[0].clientY - this.yOffset;

        // Add dragging styles
        taskElement.classList.add('dragging');
        document.body.classList.add('is-dragging');

        // Create and insert placeholder
        this.createPlaceholder(taskElement);

        // Trigger haptic feedback
        this.app.telegram?.hapticFeedback('medium');
    }

    createDragFeedback(element, touch) {
        const rect = element.getBoundingClientRect();
        const clone = element.cloneNode(true);
        
        clone.style.position = 'fixed';
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.zIndex = '1000';
        clone.style.opacity = '0.9';
        clone.style.transform = 'scale(1.05)';
        clone.style.transition = 'transform 0.2s ease';
        clone.classList.add('task-dragging');

        document.body.appendChild(clone);
        this.draggedElement = clone;

        // Calculate offset from touch point to element edges
        this.xOffset = touch.clientX - rect.left;
        this.yOffset = touch.clientY - rect.top;
    }

    createPlaceholder(element) {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'task-placeholder';
        this.placeholder.style.height = `${element.offsetHeight}px`;
        this.placeholder.style.transition = 'all 0.2s ease';
        element.parentNode.insertBefore(this.placeholder, element);
    }

    handleTouchMove(e) {
        if (!this.draggedElement) return;
        e.preventDefault();

        this.currentX = e.touches[0].clientX - this.initialX;
        this.currentY = e.touches[0].clientY - this.initialY;

        // Update dragged element position
        this.updateDragPosition();

        // Handle auto-scrolling
        this.handleAutoScroll(e.touches[0]);

        // Find and update drop target
        this.updateDropTarget(e.touches[0]);
    }

    updateDragPosition() {
        const transform = `translate(${this.currentX}px, ${this.currentY}px)`;
        this.draggedElement.style.transform = `${transform} scale(1.05)`;
    }

    handleAutoScroll(touch) {
        const SCROLL_ZONE_SIZE = 50;
        const SCROLL_SPEED = 15;
        
        clearTimeout(this.scrollTimeout);

        const scrollContainer = document.querySelector('.task-list');
        const containerRect = scrollContainer.getBoundingClientRect();

        const topZone = touch.clientY - containerRect.top < SCROLL_ZONE_SIZE;
        const bottomZone = containerRect.bottom - touch.clientY < SCROLL_ZONE_SIZE;

        if (topZone || bottomZone) {
            this.scrollTimeout = setTimeout(() => {
                if (topZone) {
                    scrollContainer.scrollTop -= SCROLL_SPEED;
                } else {
                    scrollContainer.scrollTop += SCROLL_SPEED;
                }
                this.handleAutoScroll(touch);
            }, 16); // ~60fps
        }
    }

    updateDropTarget(touch) {
        const targetElement = this.getTargetAtPoint(touch.clientX, touch.clientY);
        if (!targetElement) return;

        const isList = targetElement.classList.contains('task-list');
        const isTask = targetElement.classList.contains('task-item');

        if (isList || isTask) {
            const rect = targetElement.getBoundingClientRect();
            const middle = rect.top + rect.height / 2;
            const position = touch.clientY < middle ? 'before' : 'after';

            this.movePlaceholder(isTask ? targetElement : null, position);
        }
    }

    movePlaceholder(target, position) {
        if (!this.placeholder) return;

        if (target) {
            target.parentNode.insertBefore(
                this.placeholder,
                position === 'before' ? target : target.nextSibling
            );
        }

        // Animate placeholder
        requestAnimationFrame(() => {
            this.placeholder.style.transform = 'scaleY(1)';
            this.placeholder.style.opacity = '1';
        });
    }

    handleTouchEnd() {
        if (!this.draggedElement) return;

        // Get final position from placeholder
        const finalPosition = this.placeholder.getBoundingClientRect();
        
        // Animate to final position
        this.draggedElement.style.transition = 'all 0.2s ease';
        this.draggedElement.style.transform = `translate(
            ${finalPosition.left - this.initialX}px,
            ${finalPosition.top - this.initialY}px
        ) scale(1)`;

        // Update task position in data
        this.updateTaskPosition();

        // Cleanup
        setTimeout(() => {
            this.draggedElement.remove();
            this.placeholder.remove();
            document.body.classList.remove('is-dragging');
            
            // Trigger haptic feedback
            this.app.telegram?.hapticFeedback('success');
        }, 200);

        this.draggedElement = null;
        this.placeholder = null;
        this.draggedTask = null;
    }

    updateTaskPosition() {
        if (!this.placeholder || !this.draggedTask) return;

        const newList = this.placeholder.closest('.task-list');
        const newListId = newList?.dataset.listId;
        
        if (!newListId) return;

        const prevTask = this.placeholder.previousElementSibling;
        const nextTask = this.placeholder.nextElementSibling;

        this.app.dataManager.reorderTask(
            this.draggedTask.id,
            newListId,
            prevTask?.dataset.taskId || null,
            nextTask?.dataset.taskId || null
        );
    }

    getTargetAtPoint(x, y) {
        const elements = document.elementsFromPoint(x, y);
        return elements.find(el => 
            el.classList.contains('task-item') ||
            el.classList.contains('task-list')
        );
    }

    setupScrollZones() {
        const scrollZones = document.createElement('div');
        scrollZones.className = 'scroll-zones';
        scrollZones.innerHTML = `
            <div class="scroll-zone scroll-zone-top"></div>
            <div class="scroll-zone scroll-zone-bottom"></div>
        `;
        document.body.appendChild(scrollZones);
    }
} 