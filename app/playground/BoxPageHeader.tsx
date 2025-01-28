// BoxPageHeader.tsx
'use client';

import { useBoxContext } from '@components/box-page';
import CustomizeViewPopover from '@components/box-page/app-bar/CustomizeViewPopover';
import CatalogSelect from '@components/box-page/CatalogSelect';
import {
  FlowchartAdapterSelect,
  FlowchartAlgorithmSelect,
  FlowchartProblemSelect,
  FlowchartVisualizerSelect,
} from '@components/flowchart';
import { FlowchartModeProvider } from '@components/flowchart/FlowchartModeProvider';
import { Button, MaterialSymbol } from '@components/ui';
import Popover from '@components/ui/Popover';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { DbBoxSaved, DbSandboxObjectSaved } from '@utils/db';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { BoxPageHeaderParameters } from './BoxPageHeaderParameters';

interface BoxPageHeaderProps {
  handleSaveClick: () => void;
  handleDeleteClick: () => void;
  groupedBoxOptions: CatalogGroup<DbSandboxObjectSaved<'box'>>[];
  selectedOption: CatalogOption<DbBoxSaved> | undefined;
  isExecutionPageVisible: boolean;
  hasBox: boolean;
}
export function BoxPageHeader({
  handleSaveClick,
  handleDeleteClick,
  groupedBoxOptions,
  selectedOption,
  isExecutionPageVisible,
  hasBox,
}: BoxPageHeaderProps) {
  const router = useRouter();
  const { isBoxCustom } = useBoxContext();
  const visualizerAliases = useBoxContext('visualizers.aliases');
  const adapterAliases = useBoxContext('config.tree.adapters');

  const handleCopyLinkClick = () => {
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="flex justify-between flex-1 px-2">
      <div className="flex flex-1 md:flex-none items-center gap-2 py-2">
        <CatalogSelect
          containerClassName="flex-1 md:flex-auto"
          className="w-full"
          options={groupedBoxOptions}
          label="Select box"
          hideLabel={true}
          variant="primary"
          value={selectedOption}
          onChange={(option) => {
            if (option === null) {
              router.push('/playground');
              return;
            }
            router.push(`/playground?box=${option.value.key}`);
          }}
        />
        {isExecutionPageVisible && (
          <Popover
            content={
              <FlowchartModeProvider
                flowchartMode="basic"
                onFlowchartModeChange={() => {}}
              >
                <div className="p-4 flex flex-col gap-2">
                  <FlowchartProblemSelect />
                  <FlowchartAlgorithmSelect />
                  {Object.keys(adapterAliases ?? {}).map((alias) => (
                    <FlowchartAdapterSelect key={alias} alias={alias} />
                  ))}
                  {Object.keys(visualizerAliases).map((alias) => (
                    <FlowchartVisualizerSelect key={alias} alias={alias} />
                  ))}
                </div>
              </FlowchartModeProvider>
            }
          >
            <Button
              label="Customize"
              hideLabel
              variant="filled"
              icon={<MaterialSymbol icon="tune" />}
            />
          </Popover>
        )}
        {hasBox && (
          <div className="hidden md:flex gap-2 min-w-0">
            {!isBoxCustom && (
              <Button
                label="Copy link"
                onClick={handleCopyLinkClick}
                hideLabel
                icon={<MaterialSymbol icon="link" />}
              />
            )}
            <Button
              label="Save"
              onClick={handleSaveClick}
              hideLabel
              icon={<MaterialSymbol icon="save" />}
            />
            {isBoxCustom && (
              <Button
                label="Delete"
                hideLabel
                onClick={handleDeleteClick}
                icon={<MaterialSymbol icon="delete" />}
              />
            )}
          </div>
        )}
      </div>
      {isExecutionPageVisible && (
        <div className="ms-4 hidden lg:flex items-center gap-4">
          <BoxPageHeaderParameters />
          <CustomizeViewPopover />
        </div>
      )}
    </div>
  );
}
