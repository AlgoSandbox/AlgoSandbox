import { DbSandboxObjectSaved } from '@utils/db';

import SandboxObjectEditorPage from '../../app/SandboxObjectEditor';
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
        mode="edit"
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
        onSave={async (newObject) => {
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
