import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";

interface NumericInputProps extends Omit<ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumericInput({ value, onChange, min, max, onBlur, ...props }: NumericInputProps) {
  const [display, setDisplay] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setDisplay(String(value));
    }
  }, [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) {
      setDisplay(String(value));
      return;
    }
    let clamped = n;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    setDisplay(String(clamped));
    onChange(clamped);
  };

  return (
    <Input
      {...props}
      type="number"
      inputMode="numeric"
      value={display}
      onChange={(e) => setDisplay(e.target.value)}
      onFocus={(e) => {
        focused.current = true;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        focused.current = false;
        commit(e.target.value);
        onBlur?.(e);
      }}
    />
  );
}
