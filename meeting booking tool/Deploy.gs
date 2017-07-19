// Deploy new instance
function deployNew(){
  /* calendarID: ID of the calendar to use to store the empty slots
  */
  var calendarIDval = "";

  /* supervisorID: ID of the calendar of the supervisor
  */
  var supervisorIDval= "";

  /* weeklymeetingname: String to use as title of the free slots
  */
  var meetingNameval = "freeslot01"

  // Open a form by ID and create a new spreadsheet.
  var form = FormApp.getActiveForm();
  var sheet = SpreadsheetApp.create('Meeting Booking Responses');
  DriveApp.getFileById(form.getId()).getParents().next().addFile(DriveApp.getFileById(sheet.getId()));
  DriveApp.removeFile(DriveApp.getFileById(sheet.getId()));
  var sheetID = sheet.getId();

  // Update the form's response destination.
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheetID);

  /* sheetID: ID of the google sheet used to store the data (response and free slots)
  */
  var sheetIDval = sheetID;

  /* sheetTabName: name of the tab in the sheet where the
  */
  var sheetTabNameval = "av_Weekly_Meeting";
  //Create a new tab in the destination sheet
  sheet.insertSheet(sheetTabNameval);



  /* Setting up the form
  */
  // Update form properties via chaining.

  form.setTitle('Meeting Booking Tool')
      .setDescription('Use this tool for scheduling a time with your favorite supervisor')
      .setConfirmationMessage('Your response has been recorded. You should receive a calendar invite very soon  !')
      .setAllowResponseEdits(false)
      .setAcceptingResponses(true);

  form.addTextItem().setTitle('Name')
                    .setRequired(true);

  var textValidation = FormApp.createTextValidation().requireTextIsEmail().build();
  form.addTextItem().setTitle('Email for calendar Invitation').setValidation(textValidation).setRequired(true);

  form.addParagraphTextItem().setTitle('Meeting Description')
                             .setHelpText('Enter the agenda of the meeting and attendees list')
                             .setRequired(true);
  form.addPageBreakItem().setTitle('Meetings Choice')
                             .setHelpText('Select one of the available time for a meeting. Note: Meetings can be booked up to four weeks in advance');
  var question = form.addMultipleChoiceItem().setTitle('Pick one of the followings');



  /* questionID: ID of the form question where the free slots are listed
  */
  var questionIDval = question.getId();

  // Create all Script properties
  var scriptProps = PropertiesService.getScriptProperties();
  scriptProps.setProperties({
   'calendarID': calendarIDval,
   'supervisorID': supervisorIDval,
   'meetingName': meetingNameval,
   'sheetID': sheetIDval,
   'sheetTabName': sheetTabNameval,
    'questionID': questionIDval
  });

  /*Setting up the triggers for the project
  */
   // Submit Routine
  ScriptApp.newTrigger("submitRoutine").forForm(form).onFormSubmit().create();
  // update Event list every 6 hours
  ScriptApp.newTrigger("updateEventList")
   .timeBased()
   .everyHours(6)
   .create();
  // clean schedule every days during the night
  ScriptApp.newTrigger("cleaning").timeBased().everyDays(1).atHour(2).create();

}
