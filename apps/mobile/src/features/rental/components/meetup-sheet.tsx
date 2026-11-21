import type { MeetupProposalInput } from "@wearly/shared/api/types";
import { Chip } from "@wearly/ui-native/badge";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { useEffect, useState } from "react";
import { View } from "react-native";

const TIMES = ["10:00", "13:00", "17:00", "19:00"] as const;

const TIME_LABEL: Record<(typeof TIMES)[number], string> = {
  "10:00": "10 am",
  "13:00": "1 pm",
  "17:00": "5 pm",
  "19:00": "7 pm",
};

function isoDay(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayLabel(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(date);
}

const DAYS = [1, 2, 3, 4, 5, 6].map(isoDay);

interface MeetupSheetProps {
  defaultArea: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: MeetupProposalInput) => void;
  open: boolean;
}

/**
 * A public place, a day and a time. No map, no address, no coordinates.
 *
 * The same sheet proposes and counter-proposes; the API supersedes the previous
 * open proposal, so there is never more than one meetup to look at.
 */
export function MeetupSheet({
  defaultArea,
  isPending,
  onClose,
  onSubmit,
  open,
}: MeetupSheetProps) {
  const [placeName, setPlaceName] = useState("");
  const [areaLabel, setAreaLabel] = useState(defaultArea);
  const [day, setDay] = useState(DAYS[0] ?? "");
  const [time, setTime] = useState<(typeof TIMES)[number]>("17:00");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setAreaLabel(defaultArea);
      setError("");
    }
  }, [defaultArea, open]);

  const submit = () => {
    if (placeName.trim().length < 2) {
      setError("Name the public place you have in mind");
      return;
    }
    if (areaLabel.trim().length === 0) {
      setError("Add the area so the other person can find it");
      return;
    }

    const scheduledAt = new Date(`${day}T${time}:00`);
    if (scheduledAt.getTime() <= Date.now()) {
      setError("Choose a time in the future");
      return;
    }

    setError("");
    onSubmit({
      areaLabel: areaLabel.trim(),
      note: note.trim() || undefined,
      placeName: placeName.trim(),
      scheduledAt: scheduledAt.toISOString(),
    });
  };

  return (
    <BottomSheet
      footer={
        <Button disabled={isPending} onPress={submit} size="lg">
          {isPending ? "Sending…" : "Propose this meetup"}
        </Button>
      }
      onClose={onClose}
      open={open}
      title="Agree on a meetup"
    >
      <View className="flex-row items-start gap-3 rounded-card bg-accent p-4">
        <Text className="flex-1" tone="accent-foreground" variant="bodySm">
          Meet somewhere public — a café, a mall, a station. Never share your
          home address.
        </Text>
      </View>

      <TextField
        label="Public place"
        onChangeText={setPlaceName}
        placeholder="Blue Tokai, Bandra"
        value={placeName}
      />
      <TextField
        hint="Shown on the rental. The exact spot is agreed in person."
        label="Area"
        onChangeText={setAreaLabel}
        placeholder="Bandra West"
        value={areaLabel}
      />

      <View className="gap-2">
        <Text variant="label">Day</Text>
        <View className="flex-row flex-wrap gap-2">
          {DAYS.map((option) => (
            <Chip
              key={option}
              onPress={() => setDay(option)}
              selected={day === option}
            >
              {dayLabel(option)}
            </Chip>
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text variant="label">Time</Text>
        <View className="flex-row flex-wrap gap-2">
          {TIMES.map((option) => (
            <Chip
              key={option}
              onPress={() => setTime(option)}
              selected={time === option}
            >
              {TIME_LABEL[option]}
            </Chip>
          ))}
        </View>
      </View>

      <TextField
        label="Note (optional)"
        multiline
        onChangeText={setNote}
        placeholder="I'll be near the entrance."
        value={note}
      />

      {error.length > 0 ? (
        <Text accessibilityRole="alert" tone="destructive" variant="bodySm">
          {error}
        </Text>
      ) : null}
    </BottomSheet>
  );
}
