function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function shiftDay(base: Date, offsetDays: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + offsetDays);
  return next;
}

function formatClockTime(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatCalendarDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatLearningTimestamp(
  value: string | null | undefined,
  now = new Date(),
) {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  if (isSameDay(date, now)) {
    return `今天 ${formatClockTime(date)}`;
  }

  if (isSameDay(date, shiftDay(now, -1))) {
    return `昨天 ${formatClockTime(date)}`;
  }

  return formatCalendarDate(date);
}
