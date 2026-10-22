import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "shared/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const valoresSlider = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("w-full data-[disabled]:opacity-50", className)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="relative flex w-full touch-none select-none items-center py-2"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-0.5 w-full grow rounded-full bg-primary/30"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="h-full rounded-full bg-primary"
          />
          {Array.from({ length: valoresSlider.length }, (_, indice) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              index={indice}
              key={indice}
              className="block size-4 shrink-0 rounded-full border-2 border-[#140D0A] bg-primary shadow-sm outline-none ring-primary/50 transition-[box-shadow] hover:ring-4 focus-visible:ring-4 data-[disabled]:pointer-events-none"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };