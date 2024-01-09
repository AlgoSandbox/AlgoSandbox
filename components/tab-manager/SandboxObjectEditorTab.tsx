import { DbSandboxObjectSaved } from '@utils/db';

import SandboxObjectEditorPage from '../../app/SandboxObjectEditorPage';
import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const sandboxObjectEditorTabConfig: SandboxBaseTabConfig<
  'editor',
  {
    object: DbSandboxObjectSaved;
  }
> = {
  type: 'editor',
  icon: 'extension',
  subIcon: 'edit',
  render: ({ context: { addTab, setTab }, tab, data: { object } }) => {
    return (
      <SandboxObjectEditorPage
        object={object}
        onCloned={(newObject) => {
          addTab({
            type: 'editor',
            data: {
              object: newObject,
            },
            label: newObject.name,
            closeable: true,
          });
        }}
        onSaved={async (newObject) => {
          setTab({
            id: tab.id,
            type: 'editor',
            data: {
              object: newObject,
            },
            label: newObject.name,
            closeable: true,
          });
        }}
      />
    );
  },
};

type SandboxObjectEditorTab = TabFromConfig<
  typeof sandboxObjectEditorTabConfig
>;

export default SandboxObjectEditorTab;
