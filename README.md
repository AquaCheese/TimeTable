# 📅 Student Time Table Web App

A comprehensive web application for students to create and manage their personalized timetables with custom notifications.

## ✨ Features

### 🎯 Core Functionality
- **Custom Timetable Creation**: Set up timetables with configurable weeks, days, and time slots
- **Flexible Scheduling**: Choose from 5-7 days per week and customizable time ranges
- **Multiple Time Slot Durations**: 30 minutes, 45 minutes, 1 hour, 1.5 hours, or 2 hours
- **Multi-Week Support**: Plan for multiple weeks with easy week navigation

### 📱 User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Color-Coded Subjects**: 8 different color themes for easy visual organization
- **Interactive Timetable**: Click any time slot to edit or add activities
- **Excel-like Customization**: Resize cells, edit time slots, and customize table appearance

### 🔔 Smart Notifications
- **Browser Notifications**: Real-time desktop notifications for upcoming classes
- **Flexible Timing**: Get notified 5, 15, or 30 minutes before, or right at start time
- **Custom Timing**: Set your own custom notification times (1 minute to 24 hours before)
- **Multiple Custom Times**: Add multiple custom notification times for maximum flexibility
- **Per-Slot Control**: Enable/disable notifications for individual time slots
- **Smart Scheduling**: Automatically schedules notifications for future classes

### 🎨 Table Customization (Excel-like Features)
- **Resizable Cells**: Adjust cell width (80-200px) and height (40-120px) with sliders
- **Custom Time Slots**: Edit, add, or remove time slots with drag-and-drop functionality
- **Border Styles**: Choose from solid, dashed, dotted, or double border styles
- **Grid Opacity**: Adjust table transparency for better readability
- **Live Preview**: See changes in real-time as you customize
- **Drag & Drop**: Reorder time slots by dragging them up or down

### 💾 Data Management
- **Local Storage**: All data saved in your browser's local storage
- **Auto-Save**: Automatic saving of your timetable and preferences
- **Import/Export**: Export your timetable as JSON for backup or sharing
- **Persistent Settings**: Your notification preferences and customizations are remembered

## 🚀 Getting Started

### Quick Setup
1. Open `index.html` in your web browser
2. Configure your timetable parameters:
   - Number of weeks (1-52)
   - Days per week (5-7)
   - Start and end times
   - Time slot duration
3. Click "Generate Timetable"
4. Click on any time slot to add subjects, locations, and instructors

### Adding Classes
1. Click on any empty time slot
2. Fill in the details:
   - **Subject/Activity**: The name of your class or activity
   - **Location**: Room number, building, or online platform
   - **Instructor**: Teacher or professor name
   - **Notes**: Additional information
   - **Color**: Choose a color theme for visual organization
   - **Notifications**: Enable/disable notifications for this specific slot

### Customizing Your Timetable
1. Click "Customize Table" to open the customization panel
2. **Adjust Cell Dimensions**:
   - Use sliders to resize cell width and height
   - See changes applied in real-time
3. **Manage Time Slots**:
   - Click "Edit Time Slots" to open the time slot editor
   - Add new slots with "+ Add Slot"
   - Remove slots with "- Remove Slot"
   - Drag slots to reorder them
4. **Customize Appearance**:
   - Change border styles (solid, dashed, dotted, double)
   - Adjust grid opacity for better visibility
5. Click "Apply Changes" to save your customizations

### Setting Up Notifications
1. Click "Enable Notifications" in the Notifications section
2. Allow browser notifications when prompted
3. Configure your notification preferences:
   - 5 minutes before class
   - 15 minutes before class
   - 30 minutes before class
   - At class start time
   - **Custom times**: Set your own notification times
4. **For Custom Times**:
   - Check the "Custom times" option
   - Add one or more custom notification times (in minutes)
   - Examples: 10 (10 minutes), 60 (1 hour), 120 (2 hours), 1440 (1 day)
   - Click "+ Add Time" for multiple custom notifications
   - Remove unwanted times with the × button
5. Test notifications to ensure they're working

## 🎨 Customization

### Color Themes
Choose from 8 attractive color themes for your subjects:
- 🔵 Blue - Perfect for core subjects
- 🟢 Green - Great for science classes
- 🔴 Red - Ideal for important deadlines
- 🟠 Orange - Perfect for creative subjects
- 🟣 Purple - Great for languages
- 🟡 Teal - Ideal for mathematics
- 🩷 Pink - Perfect for electives
- ⚫ Gray - Great for study periods

### Time Slot Options
- **30 minutes**: Perfect for short meetings or breaks
- **45 minutes**: Common for some school systems
- **1 hour**: Standard university lecture duration
- **1.5 hours**: Extended classes or labs
- **2 hours**: Long lectures or practical sessions

## 📱 Mobile Support

The app is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Horizontal scrolling for large timetables
- Optimized button sizes for touch screens
- Mobile-specific layouts for smaller screens

## 🔒 Privacy & Data

- **100% Local**: All your data stays on your device
- **No Server**: No data is sent to external servers
- **Browser Storage**: Uses local storage for persistence
- **Offline Ready**: Works completely offline once loaded

## 💡 Tips for Best Use

### Organization
- Use consistent color coding for similar subjects
- Include room numbers for easy navigation
- Add instructor names for quick reference
- Use notes for special requirements or materials

### Table Customization
- **Cell Size**: Larger cells for detailed information, smaller for compact view
- **Time Slots**: Create irregular schedules (e.g., 9:00-10:30, 10:45-12:15)
- **Visual Style**: Use dashed borders for tentative classes, solid for confirmed
- **Opacity**: Lower opacity for background reference, full opacity for active use

### Notifications
- Enable notifications for important classes only
- Use 5-minute warnings for time-sensitive activities
- **Custom notifications**: Great for longer preparation times
  - 45 minutes: Perfect for commute time
  - 2 hours: Ideal for study preparation
  - 1 day: Excellent for assignment reminders
- Test notifications regularly to ensure they work
- Check browser notification settings if issues arise
- Combine preset and custom times for comprehensive reminders

### Data Management
- Save regularly using the "Save Timetable" button
- Export your timetable weekly as a backup
- Load saved timetables when switching devices
- Reset carefully - this action cannot be undone

## 🛠️ Technical Requirements

- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **JavaScript Enabled**: Required for all functionality
- **Local Storage**: Must be enabled for data persistence
- **Notification Permission**: Required for reminder notifications

## 🌐 GitHub Pages Deployment

This app is designed to work perfectly with GitHub Pages:

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Choose "Deploy from a branch" → main branch → root folder
4. Access your app at: `https://yourusername.github.io/TimeTable`

## 🆘 Troubleshooting

### Notifications Not Working
- Check if notifications are enabled in browser settings
- Ensure the tab remains open or pinned
- Test with the "Test Notification" button
- Try refreshing the page and re-enabling notifications

### Data Not Saving
- Check if local storage is enabled in your browser
- Clear browser cache and try again
- Export your data before clearing browser data
- Ensure you're using the same browser and device

### Timetable Not Displaying
- Check if JavaScript is enabled
- Try refreshing the page
- Clear browser cache
- Check browser console for error messages

## 🔮 Future Enhancements

Potential features for future versions:
- Recurring events across multiple weeks
- Integration with calendar apps
- Theme customization options
- Advanced notification scheduling
- Data synchronization across devices
- Print-friendly layouts
- Accessibility improvements

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

**Made with ❤️ for students who want to stay organized!**