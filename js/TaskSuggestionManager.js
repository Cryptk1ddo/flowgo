class TaskSuggestionManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.learningRate = 0.1;
        this.decayFactor = 0.95;
    }

    analyzePomodoroHistory() {
        const sessions = this.dataManager.getPomodoroSessions();
        const tasks = this.dataManager.getTasks();
        
        return tasks.map(task => {
            const taskSessions = sessions.filter(s => s.taskId === task.id);
            
            return {
                task,
                metrics: {
                    completionRate: this.calculateCompletionRate(taskSessions),
                    timeOfDay: this.analyzeTimePatterns(taskSessions),
                    productivity: this.calculateProductivity(taskSessions),
                    consistency: this.calculateConsistency(taskSessions)
                }
            };
        });
    }

    getSuggestedTasks() {
        const analysis = this.analyzePomodoroHistory();
        const currentHour = new Date().getHours();
        const dayOfWeek = new Date().getDay();

        return analysis
            .filter(a => !a.task.completed)
            .sort((a, b) => {
                const scoreA = this.calculateSuggestionScore(a, currentHour, dayOfWeek);
                const scoreB = this.calculateSuggestionScore(b, currentHour, dayOfWeek);
                return scoreB - scoreA;
            })
            .slice(0, 3)
            .map(a => ({
                ...a.task,
                matchScore: Math.round(this.calculateSuggestionScore(a, currentHour, dayOfWeek) * 100)
            }));
    }

    calculateSuggestionScore(analysis, currentHour, dayOfWeek) {
        const { metrics } = analysis;
        
        return (
            metrics.completionRate * 0.3 +
            metrics.timeOfDay[currentHour] * 0.3 +
            metrics.productivity * 0.2 +
            metrics.consistency * 0.2
        );
    }
} 