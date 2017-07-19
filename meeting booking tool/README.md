# Meeting Booking Tool
This is a simple tool to manage the meeting booking process, typically between a supervisor and the students.
The tool allows the calendar owner (supervisor) to setup free meeting time-slots, that will be made available for the users (students) to book.

The tool features:
- Simple access to a meeting booking interface through Google Forms
- Automatic invitation after the booking is performed

## Installation
The installation on your computer will require you to do the following steps:
1. Create a dedicated google calendar for holding the free slots and save the calendar ID for later
2. Create a Google Form that will be used as interface for the meeting booking
3. Open the script editor in the Google Form you previously created and import the code of this folder
4. Configure the different settings in the 'depolyNew()' function to customize the tool to your usage
5. Run the 'deployNew()' function
6. Customize your Form
7. Setup some free time-slots in the calendar, using the string configured in the script as title of the event
8. Run the 'updateEventList()' function
9. In 'Resources/Advanced Google Services', activate the *Calendar API* (v3), and activate it in your Google Admin console
