"use client";

import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EventDateTimePickerProps = {
  initialDateValue?: string | null;
  initialTimeValue?: string | null;
};

const HOUR_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIOD_OPTIONS = ["AM", "PM"] as const;

type ParsedInitialTime = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

function parseInitialDate(initialDateValue?: string | null) {
  if (!initialDateValue) {
    return undefined;
  }

  const parsedDate = new Date(`${initialDateValue}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

function parseInitialTime(initialTimeValue?: string | null): ParsedInitialTime | null {
  if (!initialTimeValue) {
    return null;
  }

  const [hoursText, minutesText] = initialTimeValue.split(":");
  const hours = Number.parseInt(hoursText ?? "", 10);
  const minutes = Number.parseInt(minutesText ?? "", 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  const normalizedMinute = String(minutes - (minutes % 5)).padStart(2, "0");

  return {
    hour: String(normalizedHour),
    minute: normalizedMinute,
    period,
  };
}

function build24HourTime(hour: string, minute: string, period: "AM" | "PM") {
  const parsedHour = Number.parseInt(hour, 10);

  if (Number.isNaN(parsedHour)) {
    return "";
  }

  const hours24 = period === "AM" ? parsedHour % 12 : (parsedHour % 12) + 12;
  return `${String(hours24).padStart(2, "0")}:${minute}`;
}

export function EventDateTimePicker({
  initialDateValue,
  initialTimeValue,
}: EventDateTimePickerProps) {
  const parsedInitialTime = parseInitialTime(initialTimeValue);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(() => parseInitialDate(initialDateValue));
  const [hour, setHour] = useState(parsedInitialTime?.hour ?? "");
  const [minute, setMinute] = useState(parsedInitialTime?.minute ?? "");
  const [period, setPeriod] = useState<"AM" | "PM" | "">(parsedInitialTime?.period ?? "");
  const hasAnyTimePart = hour.length > 0 || minute.length > 0 || period.length > 0;

  const time = hour && minute && period ? build24HourTime(hour, minute, period) : "";

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
        <Label>Time</Label>
        <div className="flex gap-2">
          <Select value={hour} onValueChange={setHour} required={hasAnyTimePart}>
            <SelectTrigger aria-label="Hour" className="w-16">
              <SelectValue placeholder="--"/>
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-60">
              {HOUR_OPTIONS.map((hourOption) => (
                <SelectItem key={hourOption} value={hourOption}>
                  {hourOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={minute} onValueChange={setMinute} required={hasAnyTimePart}>
            <SelectTrigger aria-label="Minute" className="w-20">
              <SelectValue placeholder="--"/>
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-60">
              {MINUTE_OPTIONS.map((minuteOption) => (
                <SelectItem key={minuteOption} value={minuteOption}>
                  {minuteOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(value) => setPeriod(value as "AM" | "PM") } required={hasAnyTimePart}>
            <SelectTrigger aria-label="AM or PM" className="w-20">
              <SelectValue placeholder="--"/>
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((periodOption) => (
                <SelectItem key={periodOption} value={periodOption}>
                  {periodOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <input type="hidden" name="event_date" value={date ? format(date, "yyyy-MM-dd") : ""} />
      <input type="hidden" name="event_time" value={time} />
    </div>
  );
}
