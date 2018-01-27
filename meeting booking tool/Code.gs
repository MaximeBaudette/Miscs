/**
 * Adds a custom menu to the active form, containing a single menu item for
 * invoking checkResponses() specified below.
 */
function onOpen() {
  FormApp.getUi()
      .createMenu('Extras')
      .addItem('Update form', 'updateEventList')
      .addToUi();
}

/*Routine executed on submit
- Get the Submission
- Proceed to Booking
- Update list of event
*/

function submitRoutine(e){
  // IDs of all calendar events
  var scriptProps =PropertiesService.getScriptProperties()
  var sheetID = scriptProps.getProperty("sheetID");
  var sheetTabName = scriptProps.getProperty("sheetTabName");
  var buffer = SpreadsheetApp.openById(sheetID);
  var buffer_M = buffer.getSheetByName(sheetTabName).getDataRange().getValues();

  // Form response
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  var indexResponse = itemResponses[3].getResponse().charAt(0) + itemResponses[3].getResponse().charAt(1);
  if (indexResponse.charAt(1) == ")"){
    indexResponse = indexResponse.charAt(0);
  }

  var eventID = buffer_M[0][indexResponse];

  var  booking = {
    "Event ID" : eventID,
    "Name" : itemResponses[0].getResponse(),
    "Email" : itemResponses[1].getResponse(),
    "Description":itemResponses[2].getResponse(),
  };
    bookTime(booking,scriptProps);
    updateEventList();

   }

// Performs the actual booking in the calendar
function bookTime(booking,scriptProps){
  var calendar = scriptProps.getProperty("calendarID");
  var supervisorID = scriptProps.getProperty("supervisorID");
  var event = Calendar.Events.get(calendar, booking["Event ID"].slice(0,-11));
  var pa = {
 "summary": "Meeting with " + booking["Name"],
 "description": booking["Description"],
 "attendees": [
  {"email": booking["Email"]},
  {"email": supervisorID}]
};
  event = Calendar.Events.patch(pa, calendar, booking["Event ID"].slice(0,-11), {
    sendNotifications: true
  });

}

// Cleaning function executed every night for the upcoming day
function cleaning(){
  var scriptProps =PropertiesService.getScriptProperties();
  //Weekly Meetings
  //search string for meetings
  var weeklyMeetingNAME = scriptProps.getProperty("meetingName");

  // List of events from calendar
  var calEvents = getCalEvents(weeklyMeetingNAME,1);

  for (var j = 0; j < calEvents.length; j++) {
  calEvents[j].deleteEvent();
  }

  // Update the form once the calendar has been cleaned
  updateEventList();
}

//Updates the list of available slots
function updateEventList(){
    var scriptProps =PropertiesService.getScriptProperties()
  // Buffer containing availability
  var sheetID = scriptProps.getProperty("sheetID");
  var buffer = SpreadsheetApp.openById(sheetID);

  // ID of the form question
  var weeklyMeetingID = scriptProps.getProperty("questionID");

  //search string for weekly meetings
  var weeklyMeetingNAME = scriptProps.getProperty("weeklymeetingname");

  updateQuestionForm(weeklyMeetingID, buffer, "av_Weekly_Meeting", weeklyMeetingNAME)

}

function updateQuestionForm(QuestionID, buffer, buffer_sheet, MeetingNAME){
  // Question in the Form
  var question =  FormApp.getActiveForm().getItemById(QuestionID);

  var buffer_Meeting = buffer.getSheetByName(buffer_sheet)
  buffer_Meeting.clear();

  // List of events from calendar
  var calEvents = getCalEvents(MeetingNAME,2);

  var choices=[];
  var choicesBis=[];
  if (calEvents.length == 0){
    //if list of event is empty indicate no option available
    choices = ["No option available at this time, close the form"];
  }
  else {
  for (var j = 0; j < calEvents.length; j++) {
    var myDate = calEvents[j].getStartTime();
    var myDateString = Utilities.formatDate(myDate, "Europe/Stockholm", "EEE, d MMM HH:mm");
    choices[j]= j + ") " + myDateString
  choicesBis[j] = calEvents[j].getId();
  }
    buffer_Meeting.appendRow(choicesBis);
  }
   question.asMultipleChoiceItem().setChoiceValues(choices);

}

function getCalEvents(searchString, alternative){
 // Determines how many events are happening in the next 4 weeks that contain the term
 // searchString.
  var scriptProps = PropertiesService.getScriptProperties();
  var calendarID = scriptProps.getProperty("calendarID");
 var calendar = CalendarApp.getCalendarById(calendarID);
 var now = new Date();
 var tomorrow1 = new Date(now.getTime() + ( 24 * 60 * 60 * 1000));
 var tomorrow = new Date(now.getTime() + (16 * 60 * 60 * 1000)); // coming day for cleaning
 var fourWeeksFromNow = new Date(now.getTime() + (28 * 24 * 60 * 60 * 1000));
  if (alternative == 1){ // Alternative 1 for cleaning the calendar
    var events = calendar.getEvents(now, tomorrow,
     {search: searchString});
  }
  else {                // Alternative 2 for looking for available time slots
 var events = calendar.getEvents(tomorrow1, fourWeeksFromNow,
                                 {search: searchString});

  }

  events = events.slice(0,10);
 return events;
}
