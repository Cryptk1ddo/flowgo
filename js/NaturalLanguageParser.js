class NaturalLanguageParser {
    constructor() {
        this.timeKeywords = {
            today: 0,
            tomorrow: 1,
            morning: { start: 9, end: 12 },
            noon: { start: 12, end: 13 },
            afternoon: { start: 13, end: 17 },
            evening: { start: 17, end: 20 },
            night: { start: 20, end: 23 }
        };

        this.daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        this.months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        
        // Initialize date-fns library for advanced date parsing
        this.initializeDateParser();
    }

    parseEventText(text) {
        try {
            // Normalize input text
            const normalizedText = text.toLowerCase().trim();
            
            // Extract basic event information
            const eventInfo = {
                title: this.extractTitle(normalizedText),
                startDate: this.extractDateTime(normalizedText),
                endDate: this.extractEndDateTime(normalizedText),
                location: this.extractLocation(normalizedText),
                people: this.extractPeople(normalizedText),
                recurrence: this.extractRecurrence(normalizedText),
                reminders: this.extractReminders(normalizedText)
            };

            // Set default duration if no end time specified
            if (!eventInfo.endDate) {
                eventInfo.endDate = new Date(eventInfo.startDate.getTime() + (60 * 60 * 1000)); // 1 hour default
            }

            return eventInfo;
        } catch (error) {
            console.error('Error parsing event text:', error);
            throw new Error('Could not parse event text. Please try again with a different format.');
        }
    }

    extractTitle(text) {
        // Remove date/time related parts
        let title = text
            .replace(/\b(on|at|from|to|with|in|next|this|every|daily|weekly|monthly|yearly)\b.*$/, '')
            .replace(/\b(morning|afternoon|evening|night|noon|today|tomorrow)\b/, '')
            .replace(/\b\d{1,2}(:\d{2})?\s*(am|pm)\b/g, '')
            .trim();

        // Capitalize first letter of each word
        return title.replace(/\b\w/g, l => l.toUpperCase());
    }

    extractDateTime(text) {
        const date = new Date();
        let matched = false;

        // Check for specific date patterns
        const patterns = [
            {
                // Today/Tomorrow
                regex: /\b(today|tomorrow)\b/i,
                handler: (match) => {
                    const days = this.timeKeywords[match[1].toLowerCase()];
                    date.setDate(date.getDate() + days);
                    matched = true;
                }
            },
            {
                // Next day of week (next monday)
                regex: /\bnext\s+(\w+)\b/i,
                handler: (match) => {
                    const targetDay = this.daysOfWeek.indexOf(match[1].toLowerCase());
                    if (targetDay !== -1) {
                        const currentDay = date.getDay();
                        const daysToAdd = (targetDay + 7 - currentDay) % 7;
                        date.setDate(date.getDate() + daysToAdd);
                        matched = true;
                    }
                }
            },
            {
                // Specific date (March 15th)
                regex: /\b(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
                handler: (match) => {
                    const monthIndex = this.months.indexOf(match[1].toLowerCase());
                    if (monthIndex !== -1) {
                        date.setMonth(monthIndex);
                        date.setDate(parseInt(match[2]));
                        matched = true;
                    }
                }
            }
        ];

        // Apply patterns
        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                pattern.handler(match);
                break;
            }
        }

        // Extract time
        const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2] || '0');
            const meridiem = timeMatch[3]?.toLowerCase();

            // Convert to 24-hour format
            if (meridiem === 'pm' && hours < 12) hours += 12;
            if (meridiem === 'am' && hours === 12) hours = 0;

            date.setHours(hours, minutes, 0, 0);
            matched = true;
        } else {
            // Check for time keywords
            for (const [keyword, time] of Object.entries(this.timeKeywords)) {
                if (text.includes(keyword) && typeof time === 'object') {
                    date.setHours(time.start, 0, 0, 0);
                    matched = true;
                    break;
                }
            }
        }

        if (!matched) {
            throw new Error('Could not determine date and time from text');
        }

        return date;
    }

    extractEndDateTime(text) {
        const endTimeMatch = text.match(/\bto\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
        if (!endTimeMatch) return null;

        const endDate = new Date(this.extractDateTime(text));
        let hours = parseInt(endTimeMatch[1]);
        const minutes = parseInt(endTimeMatch[2] || '0');
        const meridiem = endTimeMatch[3]?.toLowerCase();

        // Convert to 24-hour format
        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;

        endDate.setHours(hours, minutes, 0, 0);
        return endDate;
    }

    extractLocation(text) {
        const locationMatch = text.match(/\bat\s+([^,]+?)(?=\s*(?:on|at|from|to|$))/i);
        return locationMatch ? locationMatch[1].trim() : null;
    }

    extractPeople(text) {
        const peopleMatch = text.match(/\bwith\s+(.+?)(?=\s*(?:on|at|from|to|$))/i);
        if (!peopleMatch) return [];

        return peopleMatch[1]
            .split(/(?:,|\band\b)+/)
            .map(person => person.trim())
            .filter(Boolean);
    }

    extractRecurrence(text) {
        const patterns = {
            daily: /\bevery\s+day\b/i,
            weekly: /\bevery\s+week\b/i,
            monthly: /\bevery\s+month\b/i,
            yearly: /\bevery\s+year\b/i
        };

        for (const [frequency, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                return { frequency, interval: 1 };
            }
        }

        return null;
    }

    extractReminders(text) {
        const reminderMatch = text.match(/\bremind(?:\s+me)?\s+(\d+)\s+(minute|hour|day)s?\s+before\b/i);
        if (!reminderMatch) return [60]; // Default 1 hour reminder

        const amount = parseInt(reminderMatch[1]);
        const unit = reminderMatch[2].toLowerCase();
        
        const multipliers = {
            minute: 1,
            hour: 60,
            day: 1440
        };

        return [amount * multipliers[unit]];
    }

    // Example usage
    suggestCorrections(text) {
        const suggestions = [];
        
        // Check for missing time
        if (!text.match(/\b\d{1,2}(?::\d{2})?\s*(am|pm)?\b/i)) {
            suggestions.push('Add a specific time (e.g., "at 3pm")');
        }

        // Check for missing date
        if (!text.match(/\b(today|tomorrow|next|on)\b/i)) {
            suggestions.push('Add a date (e.g., "tomorrow" or "next Monday")');
        }

        return suggestions;
    }
}

// Usage example in CalendarManager
class CalendarManager {
    // ... previous methods ...

    initializeNaturalLanguageInput() {
        const parser = new NaturalLanguageParser();
        const input = document.createElement('input');
        input.className = 'natural-language-input';
        input.placeholder = 'Add event (e.g., "Meeting with John tomorrow at 2pm")';

        input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                try {
                    const eventInfo = parser.parseEventText(input.value);
                    await this.createEventFromNaturalLanguage(eventInfo);
                    input.value = '';
                } catch (error) {
                    const suggestions = parser.suggestCorrections(input.value);
                    this.showParsingError(error.message, suggestions);
                }
            }
        });

        // Add autocomplete suggestions
        this.setupAutocomplete(input);
        
        return input;
    }

    async createEventFromNaturalLanguage(eventInfo) {
        const event = new Event(
            null,
            eventInfo.title,
            '',
            eventInfo.startDate,
            eventInfo.endDate
        );

        if (eventInfo.location) event.location = eventInfo.location;
        if (eventInfo.recurrence) event.recurrence = eventInfo.recurrence;
        if (eventInfo.reminders) event.reminders = eventInfo.reminders;

        // Add people as attendees if supported
        if (eventInfo.people.length > 0) {
            event.attendees = eventInfo.people.map(name => ({ name }));
        }

        await this.dataManager.addEvent(event);
        this.renderCalendar();
        
        // Show success message
        this.showNotification(`Event "${event.title}" created successfully`);
    }

    setupAutocomplete(input) {
        const commonPhrases = [
            'Meeting with ',
            'Lunch at ',
            'Call with ',
            'Doctor appointment at ',
            'Reminder to '
        ];

        input.addEventListener('input', () => {
            const text = input.value.toLowerCase();
            const suggestions = commonPhrases
                .filter(phrase => phrase.toLowerCase().startsWith(text))
                .slice(0, 5);

            this.showAutocompleteSuggestions(suggestions, input);
        });
    }
} 