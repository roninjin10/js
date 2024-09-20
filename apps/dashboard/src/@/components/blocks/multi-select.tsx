"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDown, SearchIcon, XIcon } from "lucide-react";
import * as React from "react";
import { useShowMore } from "../../lib/useShowMore";
import { ScrollShadow } from "../ui/ScrollShadow/ScrollShadow";
import { Input } from "../ui/input";

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  options: {
    label: string;
    value: string;
  }[];

  selectedValues: string[];
  onSelectedValuesChange: (value: string[]) => void;
  placeholder: string;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onSelectedValuesChange,
      placeholder,
      maxCount = Number.POSITIVE_INFINITY,
      className,
      selectedValues,
      ...props
    },
    ref,
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    const handleInputKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          setIsPopoverOpen(true);
        } else if (event.key === "Backspace" && !event.currentTarget.value) {
          const newSelectedValues = [...selectedValues];
          newSelectedValues.pop();
          onSelectedValuesChange(newSelectedValues);
        }
      },
      [selectedValues, onSelectedValuesChange],
    );

    const toggleOption = React.useCallback(
      (option: string) => {
        const newSelectedValues = selectedValues.includes(option)
          ? selectedValues.filter((value) => value !== option)
          : [...selectedValues, option];
        onSelectedValuesChange(newSelectedValues);
      },
      [selectedValues, onSelectedValuesChange],
    );

    const handleClear = React.useCallback(() => {
      onSelectedValuesChange([]);
    }, [onSelectedValuesChange]);

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = React.useCallback(() => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      onSelectedValuesChange(newSelectedValues);
    }, [selectedValues, onSelectedValuesChange, maxCount]);

    // show 50 initially and then 20 more when reaching the end
    const { itemsToShow, lastItemRef } = useShowMore<HTMLButtonElement>(50, 20);

    const optionsToShow = React.useMemo(() => {
      const searchValLowercase = searchValue.toLowerCase();
      const filteredOptions = options.filter((option) => {
        return option.label.toLowerCase().includes(searchValLowercase);
      });

      return filteredOptions.slice(0, itemsToShow);
    }, [options, searchValue, itemsToShow]);

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-full p-3 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
              className,
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between w-full">
                {/* badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value);
                    return (
                      <ClosableBadge
                        key={value}
                        label={option?.label || ""}
                        onClose={() => toggleOption(value)}
                      />
                    );
                  })}

                  {/* +X more */}
                  {selectedValues.length > maxCount && (
                    <ClosableBadge
                      label={`+ ${selectedValues.length - maxCount} more`}
                      onClose={clearExtraOptions}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Clear All */}
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                  {/* biome-ignore lint/a11y/useFocusableInteractive: <explanation> */}
                  <div
                    role="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                    className="hover:bg-muted p-1 rounded"
                  >
                    <XIcon className="h-4 cursor-pointer text-muted-foreground" />
                  </div>

                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="center"
          sideOffset={10}
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
          style={{
            width: "var(--radix-popover-trigger-width)",
            maxHeight: "var(--radix-popover-content-available-height)",
          }}
        >
          <div>
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 py-4 !h-auto focus-visible:ring-0 focus-visible:ring-offset-0 border-0 border-b border-border rounded-b-none"
                onKeyDown={handleInputKeyDown}
              />
              <SearchIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>

            <ScrollShadow
              scrollableClassName="max-h-[350px] p-1"
              className="rounded"
            >
              {/* List */}
              <div>
                {optionsToShow.length === 0 && (
                  <div className="py-10 justify-center flex">
                    No results found
                  </div>
                )}

                {optionsToShow.map((option, i) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleOption(option.value)}
                      variant="ghost"
                      className="cursor-pointer flex gap-3 py-2 px-3 w-full justify-start rounded-sm"
                      ref={
                        i === optionsToShow.length - 1 ? lastItemRef : undefined
                      }
                    >
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-sm border border-foreground",
                          isSelected
                            ? "bg-inverted text-inverted-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="size-4" />
                      </div>

                      <span>{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </ScrollShadow>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

function ClosableBadge(props: {
  label: string;
  onClose: () => void;
}) {
  return (
    <span className="rounded-xl py-1 px-2 text-xs flex items-center gap-3 bg-muted border border-border text-foreground">
      {props.label}
      <XIcon
        className="h-3 w-3 cursor-pointer text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          props.onClose();
        }}
      />
    </span>
  );
}

MultiSelect.displayName = "MultiSelect";