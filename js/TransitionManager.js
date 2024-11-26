class TransitionManager {
    constructor() {
        this.currentView = null;
        this.history = [];
        this.initializeTransitions();
    }

    initializeTransitions() {
        document.documentElement.style.setProperty('--page-transition-duration', '0.3s');
        
        // Register custom transitions
        document.startViewTransition = document.startViewTransition || function(callback) {
            callback();
        };
    }

    async transition(fromView, toView, direction = 'forward') {
        const transition = await document.startViewTransition(async () => {
            // Prepare views
            fromView.classList.add('view-transitioning');
            toView.classList.add('view-transitioning');

            // Set initial states
            fromView.style.animation = this.getExitAnimation(direction);
            toView.style.animation = this.getEnterAnimation(direction);

            // Update view state
            fromView.classList.remove('active');
            toView.classList.add('active');

            // Clean up
            await this.waitForAnimations(fromView, toView);
            this.cleanupTransition(fromView, toView);
        });

        return transition.finished;
    }

    getEnterAnimation(direction) {
        const animations = {
            forward: 'slideInRight 0.3s ease forwards',
            backward: 'slideInLeft 0.3s ease forwards',
            up: 'slideInUp 0.3s ease forwards',
            down: 'slideInDown 0.3s ease forwards',
            fade: 'fadeIn 0.3s ease forwards'
        };
        return animations[direction];
    }

    getExitAnimation(direction) {
        const animations = {
            forward: 'slideOutLeft 0.3s ease forwards',
            backward: 'slideOutRight 0.3s ease forwards',
            up: 'slideOutDown 0.3s ease forwards',
            down: 'slideOutUp 0.3s ease forwards',
            fade: 'fadeOut 0.3s ease forwards'
        };
        return animations[direction];
    }

    async waitForAnimations(...elements) {
        const animations = elements.map(el => 
            el.getAnimations().map(animation => animation.finished)
        ).flat();
        await Promise.all(animations);
    }

    cleanupTransition(...views) {
        views.forEach(view => {
            view.classList.remove('view-transitioning');
            view.style.animation = '';
        });
    }
} 