class GridLayoutManager {
    constructor(app) {
        this.app = app;
        this.gridGap = 12;
        this.minColumnWidth = 280;
        this.currentLayout = 'grid'; // 'grid', 'list', 'board'
        
        this.initializeGridLayout();
        this.setupLayoutControls();
        this.handleResize();
    }

    initializeGridLayout() {
        // Create layout wrapper
        this.gridContainer = document.createElement('div');
        this.gridContainer.className = 'grid-layout-container';
        
        // Add layout controls
        const layoutControls = `
            <div class="layout-controls">
                <button class="layout-btn active" data-layout="grid">
                    <span class="material-icons">grid_view</span>
                </button>
                <button class="layout-btn" data-layout="list">
                    <span class="material-icons">view_list</span>
                </button>
                <button class="layout-btn" data-layout="board">
                    <span class="material-icons">dashboard</span>
                </button>
            </div>
        `;
        
        this.gridContainer.insertAdjacentHTML('beforebegin', layoutControls);
        
        // Initialize ResizeObserver
        this.setupResizeObserver();
    }

    setupLayoutControls() {
        document.querySelector('.layout-controls').addEventListener('click', (e) => {
            const btn = e.target.closest('.layout-btn');
            if (!btn) return;

            // Update active button
            document.querySelectorAll('.layout-btn').forEach(b => 
                b.classList.toggle('active', b === btn)
            );

            // Switch layout
            this.switchLayout(btn.dataset.layout);
        });
    }

    setupResizeObserver() {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                this.handleResize(entry.contentRect.width);
            }
        });

        resizeObserver.observe(this.gridContainer);
    }

    handleResize(containerWidth = this.gridContainer.offsetWidth) {
        const columns = Math.max(1, Math.floor(containerWidth / this.minColumnWidth));
        this.updateGridLayout(columns);
    }

    updateGridLayout(columns) {
        const container = this.gridContainer;
        
        if (this.currentLayout === 'grid') {
            container.style.setProperty('--grid-columns', columns);
            container.style.setProperty('--grid-gap', `${this.gridGap}px`);
        } else if (this.currentLayout === 'board') {
            container.style.setProperty('--grid-columns', Math.min(columns, 3));
        }
    }

    switchLayout(layout) {
        this.currentLayout = layout;
        this.gridContainer.className = `grid-layout-container layout-${layout}`;
        
        // Trigger resize handling for new layout
        this.handleResize();
        
        // Animate items
        this.animateLayoutChange();
    }

    animateLayoutChange() {
        const items = this.gridContainer.children;
        
        // Get initial positions
        const initialPositions = Array.from(items).map(item => {
            const rect = item.getBoundingClientRect();
            return { left: rect.left, top: rect.top };
        });
        
        // Force reflow
        this.handleResize();
        
        // Animate to new positions
        items.forEach((item, i) => {
            const rect = item.getBoundingClientRect();
            const deltaX = initialPositions[i].left - rect.left;
            const deltaY = initialPositions[i].top - rect.top;
            
            // Apply FLIP animation
            item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            item.style.transition = 'none';
            
            requestAnimationFrame(() => {
                item.style.transition = 'transform 0.3s ease';
                item.style.transform = 'translate(0, 0)';
            });
        });
    }
} 