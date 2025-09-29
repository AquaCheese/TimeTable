// Time Table App - Main JavaScript
class TimeTableApp {
    constructor() {
        this.currentWeek = 0;
        this.timetableData = {};
        this.config = {
            weeks: 1,
            days: 5,
            startTime: '08:00',
            endTime: '17:00',
            slotDuration: 60
        };
        this.notificationSettings = {
            enabled: false,
            before5: true,
            before15: false,
            before30: false,
            atStart: false,
            custom: false,
            customTimes: [] // Array of custom minutes before class
        };
        this.dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        this.currentEditingSlot = null;
        this.notificationTimeouts = new Map();
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.requestNotificationPermission();
    }

    bindEvents() {
        // Setup form events
        document.getElementById('generate-timetable').addEventListener('click', () => this.generateTimetable());
        document.getElementById('load-saved').addEventListener('click', () => this.loadSavedTimetable());
        
        // Timetable control events
        document.getElementById('save-timetable').addEventListener('click', () => this.saveTimetable());
        document.getElementById('reset-timetable').addEventListener('click', () => this.resetTimetable());
        document.getElementById('export-timetable').addEventListener('click', () => this.exportTimetable());
        
        // Notification events
        document.getElementById('enable-notifications').addEventListener('click', () => this.enableNotifications());
        document.getElementById('test-notification').addEventListener('click', () => this.testNotification());
        
        // Notification settings
        ['notify-before-5', 'notify-before-15', 'notify-before-30', 'notify-start', 'notify-custom'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateNotificationSettings());
        });
        
        // Custom notification events
        document.getElementById('add-custom-time').addEventListener('click', () => this.addCustomTimeInput());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-time')) {
                this.removeCustomTimeInput(e.target.parentElement);
            }
        });
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('custom-time')) {
                this.updateCustomTimes();
            }
        });
        
        // Modal events
        document.getElementById('slot-form').addEventListener('submit', (e) => this.saveSlot(e));
        document.getElementById('clear-slot').addEventListener('click', () => this.clearSlot());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        document.getElementById('slot-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('slot-modal')) {
                this.closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    generateTimetable() {
        // Get configuration from form
        this.config.weeks = parseInt(document.getElementById('weeks').value);
        this.config.days = parseInt(document.getElementById('days').value);
        this.config.startTime = document.getElementById('start-time').value;
        this.config.endTime = document.getElementById('end-time').value;
        this.config.slotDuration = parseInt(document.getElementById('slot-duration').value);
        
        // Initialize empty timetable data
        this.timetableData = {};
        for (let week = 0; week < this.config.weeks; week++) {
            this.timetableData[week] = {};
            for (let day = 0; day < this.config.days; day++) {
                this.timetableData[week][day] = {};
            }
        }
        
        this.renderTimetable();
        this.showSection('timetable-section');
        this.showSection('notifications-section');
    }

    renderTimetable() {
        const container = document.getElementById('timetable-container');
        const weekSelector = document.getElementById('week-selector');
        
        // Create week selector
        if (this.config.weeks > 1) {
            weekSelector.innerHTML = `
                <label for="week-select">Select Week:</label>
                <select id="week-select">
                    ${Array.from({length: this.config.weeks}, (_, i) => 
                        `<option value="${i}" ${i === this.currentWeek ? 'selected' : ''}>Week ${i + 1}</option>`
                    ).join('')}
                </select>
            `;
            document.getElementById('week-select').addEventListener('change', (e) => {
                this.currentWeek = parseInt(e.target.value);
                this.renderCurrentWeek();
            });
        } else {
            weekSelector.innerHTML = '';
        }
        
        this.renderCurrentWeek();
    }

    renderCurrentWeek() {
        const container = document.getElementById('timetable-container');
        const timeSlots = this.generateTimeSlots();
        
        let html = '<table class="timetable"><thead><tr><th>Time</th>';
        
        // Day headers
        for (let day = 0; day < this.config.days; day++) {
            html += `<th>${this.dayNames[day]}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        // Time slots
        timeSlots.forEach((timeSlot, slotIndex) => {
            html += `<tr><td class="time-header">${timeSlot}</td>`;
            
            for (let day = 0; day < this.config.days; day++) {
                const slotData = this.timetableData[this.currentWeek]?.[day]?.[slotIndex] || {};
                const hasData = slotData.subject;
                const colorClass = hasData ? `color-${slotData.color || 'blue'}` : '';
                
                html += `<td class="time-slot ${hasData ? 'filled' : ''} ${colorClass}" 
                            data-week="${this.currentWeek}" 
                            data-day="${day}" 
                            data-slot="${slotIndex}"
                            data-time="${timeSlot}"
                            tabindex="0">`;
                
                if (hasData) {
                    html += `<div class="slot-content">
                                <div class="subject">${slotData.subject}</div>
                                ${slotData.location ? `<div class="location">${slotData.location}</div>` : ''}
                                ${slotData.instructor ? `<div class="instructor">${slotData.instructor}</div>` : ''}
                             </div>`;
                }
                
                html += '</td>';
            }
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
        
        // Add click events to time slots
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', (e) => this.openSlotModal(e.target));
            slot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openSlotModal(e.target);
                }
            });
        });
    }

    generateTimeSlots() {
        const slots = [];
        const start = this.parseTime(this.config.startTime);
        const end = this.parseTime(this.config.endTime);
        const duration = this.config.slotDuration;
        
        let current = start;
        while (current < end) {
            const hours = Math.floor(current / 60);
            const minutes = current % 60;
            const nextSlot = current + duration;
            const nextHours = Math.floor(nextSlot / 60);
            const nextMinutes = nextSlot % 60;
            
            slots.push(`${this.formatTime(hours, minutes)} - ${this.formatTime(nextHours, nextMinutes)}`);
            current = nextSlot;
        }
        
        return slots;
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    formatTime(hours, minutes) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    openSlotModal(slotElement) {
        const week = parseInt(slotElement.dataset.week);
        const day = parseInt(slotElement.dataset.day);
        const slot = parseInt(slotElement.dataset.slot);
        const time = slotElement.dataset.time;
        
        this.currentEditingSlot = { week, day, slot, time };
        
        // Populate form with existing data
        const slotData = this.timetableData[week]?.[day]?.[slot] || {};
        document.getElementById('subject').value = slotData.subject || '';
        document.getElementById('location').value = slotData.location || '';
        document.getElementById('instructor').value = slotData.instructor || '';
        document.getElementById('notes').value = slotData.notes || '';
        document.getElementById('color').value = slotData.color || 'blue';
        document.getElementById('enable-slot-notification').checked = slotData.notifications !== false;
        
        // Update modal title
        document.querySelector('.modal-header h3').textContent = 
            `Edit ${this.dayNames[day]} - ${time}`;
        
        document.getElementById('slot-modal').style.display = 'block';
        document.getElementById('subject').focus();
    }

    saveSlot(e) {
        e.preventDefault();
        
        const { week, day, slot } = this.currentEditingSlot;
        const subject = document.getElementById('subject').value.trim();
        
        if (!this.timetableData[week]) this.timetableData[week] = {};
        if (!this.timetableData[week][day]) this.timetableData[week][day] = {};
        
        if (subject) {
            this.timetableData[week][day][slot] = {
                subject: subject,
                location: document.getElementById('location').value.trim(),
                instructor: document.getElementById('instructor').value.trim(),
                notes: document.getElementById('notes').value.trim(),
                color: document.getElementById('color').value,
                notifications: document.getElementById('enable-slot-notification').checked,
                time: this.currentEditingSlot.time,
                dayName: this.dayNames[day]
            };
        } else {
            delete this.timetableData[week][day][slot];
        }
        
        this.renderCurrentWeek();
        this.closeModal();
        this.scheduleNotifications();
        this.showSuccessMessage('Slot saved successfully!');
    }

    clearSlot() {
        const { week, day, slot } = this.currentEditingSlot;
        if (this.timetableData[week]?.[day]?.[slot]) {
            delete this.timetableData[week][day][slot];
            this.renderCurrentWeek();
            this.closeModal();
            this.showSuccessMessage('Slot cleared successfully!');
        }
    }

    closeModal() {
        document.getElementById('slot-modal').style.display = 'none';
        this.currentEditingSlot = null;
    }

    saveTimetable() {
        const data = {
            config: this.config,
            timetableData: this.timetableData,
            notificationSettings: this.notificationSettings,
            currentWeek: this.currentWeek
        };
        
        localStorage.setItem('studentTimetable', JSON.stringify(data));
        this.showSuccessMessage('Timetable saved successfully!');
        
        // Add save animation
        document.getElementById('save-timetable').classList.add('save-success');
        setTimeout(() => {
            document.getElementById('save-timetable').classList.remove('save-success');
        }, 300);
    }

    loadSavedTimetable() {
        const saved = localStorage.getItem('studentTimetable');
        if (saved) {
            const data = JSON.parse(saved);
            this.config = data.config;
            this.timetableData = data.timetableData;
            this.notificationSettings = data.notificationSettings || this.notificationSettings;
            this.currentWeek = data.currentWeek || 0;
            
            // Update form fields
            document.getElementById('weeks').value = this.config.weeks;
            document.getElementById('days').value = this.config.days;
            document.getElementById('start-time').value = this.config.startTime;
            document.getElementById('end-time').value = this.config.endTime;
            document.getElementById('slot-duration').value = this.config.slotDuration;
            
            this.renderTimetable();
            this.updateNotificationUI();
            this.showSection('timetable-section');
            this.showSection('notifications-section');
            this.scheduleNotifications();
            this.showSuccessMessage('Timetable loaded successfully!');
        } else {
            this.showErrorMessage('No saved timetable found!');
        }
    }

    loadFromStorage() {
        const saved = localStorage.getItem('studentTimetable');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.notificationSettings = data.notificationSettings || this.notificationSettings;
                this.updateNotificationUI();
            } catch (e) {
                console.error('Error loading from storage:', e);
            }
        }
    }

    resetTimetable() {
        if (confirm('Are you sure you want to reset the entire timetable? This action cannot be undone.')) {
            this.timetableData = {};
            for (let week = 0; week < this.config.weeks; week++) {
                this.timetableData[week] = {};
                for (let day = 0; day < this.config.days; day++) {
                    this.timetableData[week][day] = {};
                }
            }
            this.renderCurrentWeek();
            this.clearAllNotifications();
            this.showSuccessMessage('Timetable reset successfully!');
        }
    }

    exportTimetable() {
        const data = {
            config: this.config,
            timetableData: this.timetableData,
            notificationSettings: this.notificationSettings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetable-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('Timetable exported successfully!');
    }

    // Notification functionality
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.updateNotificationStatus(permission);
        } else {
            this.showErrorMessage('Your browser does not support notifications');
        }
    }

    enableNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.notificationSettings.enabled = true;
                this.scheduleNotifications();
                this.showSuccessMessage('Notifications enabled!');
                this.updateNotificationStatus('granted');
            } else if (Notification.permission === 'denied') {
                this.showErrorMessage('Notifications are blocked. Please enable them in your browser settings.');
            } else {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.notificationSettings.enabled = true;
                        this.scheduleNotifications();
                        this.showSuccessMessage('Notifications enabled!');
                    }
                    this.updateNotificationStatus(permission);
                });
            }
        }
    }

    testNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Test Notification', {
                body: 'This is a test notification from your Time Table app!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">📅</text></svg>',
                tag: 'test-notification'
            });
        } else {
            this.showErrorMessage('Notifications are not enabled');
        }
    }

    updateNotificationSettings() {
        this.notificationSettings.before5 = document.getElementById('notify-before-5').checked;
        this.notificationSettings.before15 = document.getElementById('notify-before-15').checked;
        this.notificationSettings.before30 = document.getElementById('notify-before-30').checked;
        this.notificationSettings.atStart = document.getElementById('notify-start').checked;
        this.notificationSettings.custom = document.getElementById('notify-custom').checked;
        
        // Show/hide custom times section
        const customSection = document.getElementById('custom-notifications-section');
        if (this.notificationSettings.custom) {
            customSection.style.display = 'block';
            customSection.classList.add('active');
            this.updateCustomTimes();
        } else {
            customSection.style.display = 'none';
            customSection.classList.remove('active');
        }
        
        if (this.notificationSettings.enabled) {
            this.scheduleNotifications();
        }
        
        this.saveTimetable();
    }

    updateNotificationUI() {
        document.getElementById('notify-before-5').checked = this.notificationSettings.before5;
        document.getElementById('notify-before-15').checked = this.notificationSettings.before15;
        document.getElementById('notify-before-30').checked = this.notificationSettings.before30;
        document.getElementById('notify-start').checked = this.notificationSettings.atStart;
        document.getElementById('notify-custom').checked = this.notificationSettings.custom;
        
        // Update custom times display
        const customSection = document.getElementById('custom-notifications-section');
        if (this.notificationSettings.custom) {
            customSection.style.display = 'block';
            customSection.classList.add('active');
            this.populateCustomTimes();
        } else {
            customSection.style.display = 'none';
            customSection.classList.remove('active');
        }
    }

    scheduleNotifications() {
        this.clearAllNotifications();
        
        if (!this.notificationSettings.enabled || Notification.permission !== 'granted') {
            return;
        }

        const now = new Date();
        const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Schedule for current week and next week
        for (let weekOffset = 0; weekOffset <= 1; weekOffset++) {
            const weekData = this.timetableData[this.currentWeek] || {};
            
            Object.entries(weekData).forEach(([dayIndex, dayData]) => {
                const dayNum = parseInt(dayIndex);
                Object.entries(dayData).forEach(([slotIndex, slotData]) => {
                    if (slotData.notifications === false) return;
                    
                    this.scheduleSlotNotifications(slotData, dayNum, weekOffset, now);
                });
            });
        }
    }

    scheduleSlotNotifications(slotData, dayIndex, weekOffset, now) {
        const [startTime] = slotData.time.split(' - ');
        const [hours, minutes] = startTime.split(':').map(Number);
        const slotTime = hours * 60 + minutes;
        
        // Calculate the date for this slot
        const today = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
        const targetDay = dayIndex + 1; // Convert to 1-7 (Monday-Sunday)
        const daysUntilSlot = (targetDay - today + 7) % 7 + (weekOffset * 7);
        
        const slotDate = new Date(now);
        slotDate.setDate(slotDate.getDate() + daysUntilSlot);
        slotDate.setHours(hours, minutes, 0, 0);
        
        // Only schedule future notifications
        if (slotDate <= now) return;
        
        const notifications = [];
        if (this.notificationSettings.before30) {
            notifications.push({ offset: 30, label: '30 minutes' });
        }
        if (this.notificationSettings.before15) {
            notifications.push({ offset: 15, label: '15 minutes' });
        }
        if (this.notificationSettings.before5) {
            notifications.push({ offset: 5, label: '5 minutes' });
        }
        if (this.notificationSettings.atStart) {
            notifications.push({ offset: 0, label: 'now' });
        }
        
        // Add custom notification times
        if (this.notificationSettings.custom && this.notificationSettings.customTimes) {
            this.notificationSettings.customTimes.forEach(minutes => {
                const offset = parseInt(minutes);
                if (offset > 0) {
                    const label = this.formatCustomTimeLabel(offset);
                    notifications.push({ offset, label });
                }
            });
        }
        
        notifications.forEach(({ offset, label }) => {
            const notificationTime = new Date(slotDate.getTime() - offset * 60 * 1000);
            const delay = notificationTime.getTime() - now.getTime();
            
            if (delay > 0) {
                const timeoutId = setTimeout(() => {
                    const message = offset === 0 
                        ? `${slotData.subject} is starting now!`
                        : `${slotData.subject} starts in ${label}`;
                    
                    const body = [
                        message,
                        slotData.location ? `Location: ${slotData.location}` : '',
                        slotData.instructor ? `Instructor: ${slotData.instructor}` : ''
                    ].filter(Boolean).join('\n');
                    
                    new Notification(`📅 ${slotData.subject}`, {
                        body: body,
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">📅</text></svg>',
                        tag: `slot-${dayIndex}-${slotData.subject}-${offset}`,
                        requireInteraction: offset === 0
                    });
                }, delay);
                
                this.notificationTimeouts.set(
                    `${dayIndex}-${slotData.subject}-${offset}`, 
                    timeoutId
                );
            }
        });
    }

    clearAllNotifications() {
        this.notificationTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.notificationTimeouts.clear();
    }

    updateNotificationStatus(permission) {
        const statusDiv = document.getElementById('notification-status');
        
        if (permission === 'granted') {
            statusDiv.className = 'notification-status success';
            statusDiv.textContent = '✅ Notifications are enabled and working!';
        } else if (permission === 'denied') {
            statusDiv.className = 'notification-status error';
            statusDiv.textContent = '❌ Notifications are blocked. Please enable them in your browser settings.';
        } else {
            statusDiv.className = 'notification-status warning';
            statusDiv.textContent = '⚠️ Click "Enable Notifications" to allow notifications for your timetable.';
        }
    }

    // Custom notification time methods
    addCustomTimeInput() {
        const container = document.querySelector('.custom-times-container');
        const inputDiv = document.createElement('div');
        inputDiv.className = 'custom-time-input';
        inputDiv.innerHTML = `
            <input type="number" class="custom-time" min="1" max="1440" placeholder="e.g., 10">
            <button type="button" class="btn-remove-time">&times;</button>
        `;
        container.appendChild(inputDiv);
        inputDiv.querySelector('.custom-time').focus();
    }

    removeCustomTimeInput(inputDiv) {
        inputDiv.style.animation = 'slideOutUp 0.3s ease-in forwards';
        setTimeout(() => {
            inputDiv.remove();
            this.updateCustomTimes();
        }, 300);
    }

    updateCustomTimes() {
        const customTimeInputs = document.querySelectorAll('.custom-time');
        const times = [];
        
        customTimeInputs.forEach(input => {
            const value = parseInt(input.value);
            if (!isNaN(value) && value > 0 && value <= 1440) {
                times.push(value);
            }
        });
        
        // Remove duplicates and sort
        this.notificationSettings.customTimes = [...new Set(times)].sort((a, b) => b - a);
        
        if (this.notificationSettings.enabled) {
            this.scheduleNotifications();
        }
    }

    populateCustomTimes() {
        const container = document.querySelector('.custom-times-container');
        container.innerHTML = '';
        
        if (this.notificationSettings.customTimes && this.notificationSettings.customTimes.length > 0) {
            this.notificationSettings.customTimes.forEach(minutes => {
                const inputDiv = document.createElement('div');
                inputDiv.className = 'custom-time-input';
                inputDiv.innerHTML = `
                    <input type="number" class="custom-time" min="1" max="1440" value="${minutes}">
                    <button type="button" class="btn-remove-time">&times;</button>
                `;
                container.appendChild(inputDiv);
            });
        } else {
            // Add one empty input by default
            this.addCustomTimeInput();
        }
    }

    formatCustomTimeLabel(minutes) {
        if (minutes < 60) {
            return `${minutes} minutes`;
        } else if (minutes === 60) {
            return '1 hour';
        } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
            } else {
                return `${hours}h ${remainingMinutes}m`;
            }
        } else {
            const days = Math.floor(minutes / 1440);
            return `${days} ${days === 1 ? 'day' : 'days'}`;
        }
    }

    // Utility functions
    showSection(sectionId) {
        document.getElementById(sectionId).style.display = 'block';
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#f56565'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            font-weight: 600;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Global functions for modal
function closeModal() {
    app.closeModal();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TimeTableApp();
});

// Service Worker registration for better notification support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}