import { useState } from 'react';
import type { FC } from 'react';
import { Calendar as ReactCalendar, dateFnsLocalizer } from 'react-big-calendar';
import type { Event } from '../../types/types.ts';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import type { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addHours, startOfHour } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const DnDCalendar = withDragAndDrop<Event>(ReactCalendar)

const Calendar: FC = () => {
  const now = new Date()
  const start = addHours(startOfHour(now), 1)
  const end = addHours(start, 2)

  const [events, setEvents] = useState<Event[]>([
    {
      title: 'Learn cool stuff',
      start,
      end,
    },
  ])

  const onEventResize: withDragAndDropProps<Event>['onEventResize'] = data => {
    const { start, end, event } = data
    setEvents(currentEvents =>
      currentEvents.map(ev =>
        ev === event ? { ...ev, start: new Date(start), end: new Date(end) } : ev
      )
    )
  }

  const onEventDrop: withDragAndDropProps<Event>['onEventDrop'] = data => {
    const { start, end, event } = data
    setEvents(currentEvents =>
      currentEvents.map(ev =>
        ev === event ? { ...ev, start: new Date(start), end: new Date(end) } : ev
      )
    )
  }

  return (
    <DnDCalendar
      defaultView="week"
      events={events}
      localizer={localizer}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      resizable
      style={{ height: '80vh' }}
    />
  )
}

export default Calendar;
