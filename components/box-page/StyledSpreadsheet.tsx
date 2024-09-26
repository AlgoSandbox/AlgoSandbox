import clsx from 'clsx';
import { ComponentProps } from 'react';
import Spreadsheet from 'react-spreadsheet';

export type StyledSpreadsheetProps = ComponentProps<typeof Spreadsheet> & {
  hideActiveCellBorder: boolean;
};

export default function StyledSpreadsheet({
  className,
  hideActiveCellBorder = false,
  ...props
}: StyledSpreadsheetProps) {
  return (
    <Spreadsheet
      className={clsx(
        String.raw`[&_.Spreadsheet\_\_header]:bg-surface`,
        String.raw`[&_.Spreadsheet\_\_header--selected]:!bg-surface-high`,
        String.raw`[&_tbody_tr:first-child_.Spreadsheet\_\_header]:sticky`,
        String.raw`[&_tbody_tr:first-child_.Spreadsheet\_\_header]:top-0`,
        String.raw`[&_.Spreadsheet\_\_cell]:!border-border`,
        String.raw`[&_.Spreadsheet\_\_floating-rect--selected]:border-accent`,
        String.raw`[&_.Spreadsheet\_\_active-cell--view]:border-accent`,
        hideActiveCellBorder &&
          String.raw`[&_.Spreadsheet\_\_active-cell--view]:border-0`,
        String.raw`[&_.Spreadsheet\_\_active-cell--view]:border-accent`,
        className,
      )}
      {...props}
    />
  );
}
