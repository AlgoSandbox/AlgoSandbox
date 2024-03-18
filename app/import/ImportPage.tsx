'use client';

import SandboxObjectEditorPage from '@app/SandboxObjectEditorPage';
import AppNavBar from '@components/AppNavBar';
import Heading from '@components/ui/Heading';
import { DbSandboxObject } from '@utils/db';
import { useSaveObjectMutation } from '@utils/db/objects';
import { useRouter } from 'next/navigation';

export default function ImportPage({
  component,
}: {
  component: DbSandboxObject;
}) {
  const router = useRouter();

  const { mutateAsync: saveObject } = useSaveObjectMutation();

  return (
    <div className="flex flex-col h-screen">
      <AppNavBar>
        <div className="flex items-center">
          <Heading variant="h4">Import {component.type}</Heading>
        </div>
      </AppNavBar>
      <SandboxObjectEditorPage
        mode="import"
        object={component}
        onSave={async (newComponent) => {
          const { key } = await saveObject(newComponent);
          router.push(`/component?key=${key}`);
        }}
      />
    </div>
  );
}
