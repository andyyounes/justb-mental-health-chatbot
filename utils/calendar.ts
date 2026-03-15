export interface CalendarEvent {
  title: string;
  description: string;
  startTime?: string;
  duration?: number; // in minutes
}

export function addToCalendar(event: CalendarEvent) {
  // Calculate start and end times
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set start time (if specified, otherwise tomorrow at 9 AM)
  let startDate: Date;
  if (event.startTime) {
    const [hours, minutes] = event.startTime.split(':');
    startDate = new Date(tomorrow);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    startDate = new Date(tomorrow);
    startDate.setHours(9, 0, 0, 0);
  }
  
  // Set end time (default 30 minutes if not specified)
  const duration = event.duration || 30;
  const endDate = new Date(startDate.getTime() + duration * 60000);
  
  // Format dates for calendar (YYYYMMDDTHHmmss)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  // Create Google Calendar URL
  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', event.title);
  googleUrl.searchParams.set('details', event.description);
  googleUrl.searchParams.set('dates', `${start}/${end}`);
  
  // Try to open in new window (works for both Google Calendar and default calendar apps)
  window.open(googleUrl.toString(), '_blank');
  
  // Also create an ICS file as fallback for users with other calendar apps
  createICSFile(event, startDate, endDate);
}

function createICSFile(event: CalendarEvent, startDate: Date, endDate: Date) {
  // Format dates for ICS (YYYYMMDDTHHmmss)
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MindfulChat//Wellness Event//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  // Create blob and download link
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `mindfulchat-${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  
  // Auto-download the ICS file (will open in default calendar app)
  link.click();
  
  // Clean up
  URL.revokeObjectURL(link.href);
}
