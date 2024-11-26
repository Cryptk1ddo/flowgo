class InteractiveComponents {
    constructor() {
        this.initializeComponents();
    }

    initializeComponents() {
        this.initializeSwipeableCards();
        this.initializeDraggableLists();
        this.initializeExpandableCards();
        this.initializeActionButtons();
    }

    initializeSwipeableCards() {
        const cards = document.querySelectorAll('.swipeable-card');
        cards.forEach(card => {
            let startX, currentX;
            const threshold = 100;

            card.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
                card.style.transition = 'none';
            });

            card.addEventListener('touchmove', e => {
                if (!startX) return;
                currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                
                if (Math.abs(diff) < threshold) {
                    card.style.transform = `translateX(${diff}px)`;
                    card.style.opacity = 1 - Math.abs(diff) / threshold;
                }
            });

            card.addEventListener('touchend', () => {
                card.style.transition = 'all 0.3s ease';
                if (Math.abs(currentX - startX) >= threshold) {
                    this.handleCardSwipe(card, currentX > startX ? 'right' : 'left');
                } else {
                    card.style.transform = '';
                    card.style.opacity = '';
                }
                startX = null;
            });
        });
    }

    initializeDraggableLists() {
        const lists = document.querySelectorAll('.draggable-list');
        lists.forEach(list => {
            new Sortable(list, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onStart: () => this.haptics.dragStart(),
                onEnd: () => this.haptics.dragEnd()
            });
        });
    }

    initializeExpandableCards() {
        const cards = document.querySelectorAll('.expandable-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('expanded');
                this.haptics.trigger('light');
            });
        });
    }

    initializeActionButtons() {
        const buttons = document.querySelectorAll('.action-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('clicked');
                this.haptics.trigger('medium');
                setTimeout(() => button.classList.remove('clicked'), 200);
            });
        });
    }
} 