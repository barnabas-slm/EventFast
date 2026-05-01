"use client";

import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type EventDateTimePickerProps = {
  initialDateValue?: string | null;
  initialTimeValue?: string | null;
};

function parseInitialDate(initialDateValue?: string | null) {
  if (!initialDateValue) {
    return undefined;
  }

  const parsedDate = new Date(`${initialDateValue}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

export function EventDateTimePicker({
  initialDateValue,
  initialTimeValue,
}: EventDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(() => parseInitialDate(initialDateValue));
  const [time, setTime] = useState(initialTimeValue ?? "");

  return (
    <div className="sm:col-span-2 grid gap-4 md:grid-cols-2 md:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-date-picker">Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              id="event-date-picker"
              className="w-full justify-between font-normal"
            >
              {date ? format(date, "PPP") : "Select date"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="event-time-picker">Time</Label>
        <Input
          id="event-time-picker"
          type="time"
          step="1"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>

      <input type="hidden" name="event_date" value={date ? format(date, "yyyy-MM-dd") : ""} />
      <input type="hidden" name="event_time" value={time} />
    </div>
  );
}
