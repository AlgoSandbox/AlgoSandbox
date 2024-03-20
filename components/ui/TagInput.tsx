import clsx from 'clsx';
import { forwardRef, useId, useMemo, useState } from 'react';

import { Button, FormLabel, MaterialSymbol } from '.';
import { InputProps } from './Input';

export type TagInputProps = Omit<InputProps, 'value' | 'onChange'> & {
  value: Array<string>;
  onChange: (value: Array<string>) => void;
};

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      label,
      hideLabel = false,
      className,
      containerClassName,
      error,
      value,
      onChange,
      ...props
    },
    forwardedRef,
  ) => {
    const id = useId();
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

    const [internalValue, setInternalValue] = useState('');

    const inputElement = useMemo(
      () => (
        <input
          aria-label={hideLabel ? label : undefined}
          aria-labelledby={!hideLabel ? id : undefined}
          ref={(input) => {
            setInputRef(input);

            if (forwardedRef === null) return;
            if (typeof forwardedRef === 'function') {
              forwardedRef(input);
            } else {
              forwardedRef.current = input;
            }
          }}
          autoComplete="off"
          className={clsx(
            'border-0 focus:outline-none focus:ring-0 bg-transparent',
            className,
            hideLabel && containerClassName,
          )}
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && internalValue === '') {
              onChange(value.slice(0, -1));
              e.preventDefault();
              e.stopPropagation();
            }
            if (e.key === 'Enter' && internalValue !== '') {
              onChange([...value, internalValue]);
              setInternalValue('');
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          {...props}
        />
      ),
      [
        className,
        containerClassName,
        forwardedRef,
        hideLabel,
        id,
        internalValue,
        label,
        onChange,
        props,
        value,
      ],
    );

    return hideLabel && !error ? (
      inputElement
    ) : (
      <div className={clsx('flex flex-col', containerClassName)}>
        {!hideLabel && <FormLabel id={id}>{label}</FormLabel>}
        <div
          className="flex flex-wrap border-2 has-[input:active]:border-accent has-[input:focus]:border-accent rounded p-2 gap-2 cursor-text"
          onClick={() => {
            return inputRef?.focus();
          }}
        >
          {value.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="border rounded ps-2 flex items-center"
            >
              {tag}
              <Button
                autoFocus={false}
                onClick={() => {
                  onChange(value.filter((_, i) => i !== index));
                }}
                hideLabel
                size="xs"
                label="Delete tag"
                icon={<MaterialSymbol icon="close" />}
              />
            </span>
          ))}
          {inputElement}
        </div>
        {error && <span className="text-danger">{error}</span>}
      </div>
    );
  },
);

TagInput.displayName = 'TagInput';

export default TagInput;
