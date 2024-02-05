import cn from 'classnames';
import dayjs from 'dayjs';
import { ForwardedRef, forwardRef } from 'react';

export function getStart(e: gapi.client.calendar.Event): dayjs.Dayjs {
  return dayjs(e.start?.dateTime ?? e.start?.date!);
}

export function getEnd(e: gapi.client.calendar.Event): dayjs.Dayjs {
  return dayjs(e.end?.dateTime ?? e.end?.date!);
}

export const TODAY = new Date(new Date().setHours(0, 0, 0, 0));

export const Calendar = forwardRef(
  (
    { events }: { events: gapi.client.calendar.Event[] },
    ref: ForwardedRef<HTMLDivElement>,
  ) => (
    <div className="mx-auto h-[480px] w-[800px] border-2 border-dashed border-neutral-300">
      <div
        ref={ref}
        className="flex h-full w-full flex-row gap-4 rounded-md pb-3 pl-1 pr-3 pt-1 text-black"
      >
        {[
          TODAY,
          new Date(TODAY.getTime() + 86400000),
          new Date(TODAY.getTime() + 86400000 * 2),
        ].map((date, i) => {
          const dayEvents = events.filter((event) =>
            getStart(event).isSame(date, 'day'),
          );
          return (
            <CalendarDay date={date} events={dayEvents} key={date.toString()} />
          );
        })}
      </div>
    </div>
  ),
);
Calendar.displayName = 'Calendar';

function CalendarDay({
  date,
  events,
}: {
  date: Date;
  events: gapi.client.calendar.Event[];
}) {
  return (
    <div
      key={date.toString()}
      className={cn(
        'relative flex-1 flex-grow overflow-clip rounded-sm border border-black bg-white px-2 py-2 shadow-long',
        'after:absolute after:bottom-0 after:h-[10%] after:w-full after:bg-fade',
      )}
    >
      <div className="border border-black p-1">
        <h1 className="inline-block text-3xl font-bold underline">
          {dayjs(date).format('dddd')}
        </h1>
        <h1 className="inline-block text-2xl font-bold">
          {dayjs(date).format('MMMM Do')}
        </h1>
      </div>
      <div className="flex h-full flex-col gap-1 pt-2 text-lg">
        {!events.length && (
          <div className="border border-black px-1">
            <span className="font-semibold">Nothing Scheduled!</span>
            <br></br>
            <span>12:00 AM - 11:59 PM</span>
          </div>
        )}
        {events.map((event) => (
          <div className="border border-black px-1" key={event.id}>
            <span className="font-semibold">{event.summary}</span>
            <br></br>
            <span>
              {dayjs(getStart(event)).format('h:mm A')} -{' '}
              {dayjs(getEnd(event)).format('h:mm A')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
