import { useId, useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

interface FacetComboboxProps {
  facetKey: string;
  label: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  helpText?: React.ReactNode;
}

// One shared control for every facet: a labeled trigger showing the current
// selection as badges, opening a searchable multi-select checkbox list.
// Replaces the old two-tier system (always-visible button rows for
// Audience/Topic vs. collapsed <details> accordions for everything else) so
// all facets read as the same kind of control.
export default function FacetCombobox({
  facetKey,
  label,
  options,
  selected,
  onToggle,
  helpText,
}: FacetComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const labelId = useId();
  const triggerId = useId();

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  return (
    <div className="lessons-facet">
      <span id={labelId} className="lessons-filter__label">
        {label}
      </span>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type="button"
            id={triggerId}
            aria-labelledby={`${labelId} ${triggerId}`}
            className="lessons-facet__trigger"
          >
            {selected.length === 0 ? (
              <span className="lessons-facet__placeholder">Any</span>
            ) : (
              <span className="lessons-facet__badges">
                {selected.map((value) => (
                  <span key={value} className="lessons-facet__badge">
                    {options.find((o) => o.value === value)?.label ?? value}
                  </span>
                ))}
              </span>
            )}
            <ChevronDownIcon className="lessons-facet__chevron" aria-hidden="true" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="lessons-facet__content"
            sideOffset={6}
            align="start"
            collisionPadding={16}
          >
            {helpText}
            <label className="lessons-facet__search-label">
              <span className="sr-only">Search {label} options</span>
              <input
                type="text"
                className="lessons-facet__search"
                placeholder={`Search ${label.toLowerCase()}…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <ul className="lessons-facet__options">
              {filteredOptions.length === 0 ? (
                <li className="lessons-facet__empty">No matches</li>
              ) : (
                filteredOptions.map(({ value, label: optionLabel, count }) => {
                  const checked = selected.includes(value);
                  const disabled = count === 0 && !checked;
                  const optionId = `${facetKey}-${value}`;
                  return (
                    <li key={value}>
                      <Checkbox.Root
                        id={optionId}
                        className="lessons-facet__checkbox"
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => onToggle(value)}
                      >
                        <Checkbox.Indicator className="lessons-facet__checkbox-indicator">
                          <CheckIcon aria-hidden="true" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <label
                        htmlFor={optionId}
                        className={`lessons-facet__option${disabled ? " is-disabled" : ""}`}
                      >
                        <span className="lessons-facet__option-label">{optionLabel}</span>
                        <span className="lessons-facet__option-count">{count}</span>
                      </label>
                    </li>
                  );
                })
              )}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
