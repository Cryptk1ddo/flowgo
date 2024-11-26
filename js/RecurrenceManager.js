class RecurrenceManager {
    constructor() {
        this.recurrencePatterns = {
            daily: {
                type: 'daily',
                intervals: [1, 2, 3], // every day, every 2 days, etc.
                options: ['weekdays', 'weekends']
            },
            weekly: {
                type: 'weekly',
                intervals: [1, 2], // weekly, bi-weekly
                options: ['specific_days'] // Mon,Wed,Fri
            },
            monthly: {
                type: 'monthly',
                intervals: [1, 2, 3, 6], // monthly, bi-monthly, quarterly, bi-annual
                options: ['day_of_month', 'day_of_week'] // 15th or "last Friday"
            },
            yearly: {
                type: 'yearly',
                intervals: [1],
                options: ['specific_months'] // specific months only
            }
        };
    }

    parseRecurrencePattern(text) {
        const patterns = {
            // Daily patterns
            dailyWeekdays: /\bevery\s+weekday\b/i,
            dailyWeekends: /\bevery\s+weekend\b/i,
            dailyInterval: /\bevery\s+(\d+)\s+days?\b/i,
            
            // Weekly patterns
            weeklySpecificDays: /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+and\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))*\b/i,
            weeklyInterval: /\bevery\s+(\d+)\s+weeks?\b/i,
            
            // Monthly patterns
            monthlyDayOfMonth: /\bevery\s+(\d+)(?:st|nd|rd|th)?\s+(?:day\s+)?of\s+(?:the\s+)?month\b/i,
            monthlyDayOfWeek: /\bevery\s+(first|second|third|fourth|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+of\s+(?:the\s+)?month\b/i,
            monthlyInterval: /\bevery\s+(\d+)\s+months?\b/i,
            
            // Yearly patterns
            yearlyMonths: /\bevery\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+and\s+(january|february|march|april|may|june|july|august|september|october|november|december))*\b/i
        };

        for (const pattern in patterns) {
            if (patterns[pattern].test(text)) {
                return pattern;
            }
        }

        return null;
    }
} 