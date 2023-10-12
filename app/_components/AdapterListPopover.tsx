import {
  counterToSearchGraphStateAdapter,
  searchGraphStateToCounterAdapter,
} from '@/lib/algo-sandbox/adapters';
import { SandboxAdapter, SandboxStateName } from '@/lib/algo-sandbox/core';
import Popover from '../../components/Popover';
import { ReactElement } from 'react';
import { Button, MaterialSymbol, Select } from '../../components';
import { SelectOption, SelectOptions } from '../../components/Select';

export type AdapterListPopoverProps = {
  fromType: SandboxStateName;
  toType: SandboxStateName;
  value: Array<
    SelectOption<SandboxAdapter<SandboxStateName, SandboxStateName>>
  >;
  onChange: (
    value: Array<
      SelectOption<SandboxAdapter<SandboxStateName, SandboxStateName>>
    >
  ) => void;
  options: SelectOptions<SandboxAdapter<SandboxStateName, SandboxStateName>>;
  children: ReactElement;
};

export default function AdapterListPopover({
  fromType,
  toType,
  value,
  onChange,
  options,
  children,
}: AdapterListPopoverProps) {
  return (
    <Popover
      content={
        <div className="min-w-[200px] p-2 flex flex-col gap-2 bg-primary-50">
          <h1>Select adapters</h1>
          {[...value, undefined].map((adapter, index) => (
            <div
              key={index + (adapter?.key ?? '')}
              className="flex gap-2 items-end"
            >
              <Select
                placeholder="Select adapter"
                containerClassName="flex-1"
                hideLabel
                label="Adapter"
                value={adapter}
                onChange={(newAdapter) => {
                  const newAdapters = [...value];
                  newAdapters[index] = newAdapter;
                  onChange(newAdapters);
                }}
                options={options}
              />
              <Button
                disabled={index === value.length}
                label="Remove"
                hideLabel
                icon={<MaterialSymbol icon="delete" />}
                onClick={() => {
                  const newAdapters = [...value];
                  newAdapters.splice(index, 1);
                  onChange(newAdapters);
                }}
              />
            </div>
          ))}
        </div>
      }
    >
      {children}
    </Popover>
  );
}
