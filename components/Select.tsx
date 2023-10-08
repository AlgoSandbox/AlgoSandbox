import { useId, useMemo } from 'react';

export type SelectOption<T> = {
  key: string;
  label: string;
  value: T;
};

export type SelectGroup<T> = {
  key: string;
  label: string;
  options: Array<SelectOption<T>>;
};

export type SelectOptions<T = any> = Array<SelectOption<T> | SelectGroup<T>>;

export type SelectProps<T> = {
  label: string;
  options: SelectOptions<T>;
  value?: SelectOption<T>;
  onChange?: (value: SelectOption<T>) => void;
};

function isGroup<T>(
  option: SelectOption<T> | SelectGroup<T>
): option is SelectGroup<T> {
  return (option as SelectGroup<T>).options !== undefined;
}

export default function Select<T>({
  label,
  options,
  value,
  onChange,
}: SelectProps<T>) {
  const id = useId();
  const flattenedOptions = useMemo(() => {
    return options.flatMap((item) => (isGroup(item) ? item.options : [item]));
  }, [options]);

  return (
    <div className="flex flex-col">
      <span id={id} className="text-sm font-medium">
        {label}
      </span>
      <select
        aria-labelledby={id}
        value={value?.key}
        onChange={(event) => {
          const key = event.target.value;
          const newValue = flattenedOptions.find(
            (option) => option.key === key
          );
          if (newValue) {
            onChange?.(newValue);
          }
        }}
      >
        {options.map((item) =>
          isGroup(item) ? (
            <optgroup key={item.key} label={item.label}>
              {item.options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ) : (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}
