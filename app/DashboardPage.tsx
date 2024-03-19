import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { MaterialSymbol } from '@components/ui';
import Heading from '@components/ui/Heading';
import { DbSandboxObjectSaved, useSavedAlgorithmsQuery } from '@utils/db';
import { useSavedAdaptersQuery } from '@utils/db/adapters';
import { useSavedProblemsQuery } from '@utils/db/problems';
import { useSavedVisualizersQuery } from '@utils/db/visualizers';
import groupOptionsByTag from '@utils/groupOptionsByTag';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type SavedObjectsSectionProps = {
  title: string;
  objects: Array<DbSandboxObjectSaved>;
};

function SavedObjectsSection({ objects, title }: SavedObjectsSectionProps) {
  const router = useRouter();

  if (objects.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Heading variant="h3">{title}</Heading>
      <ul className="flex flex-col gap-4">
        {objects.map((object) => (
          <li key={object.key}>
            <button
              className="border rounded bg-surface hover:bg-surface-high p-4 flex justify-between items-center gap-2 w-full"
              onClick={() => {
                router.push(`/component?key=${object.key}`);
              }}
            >
              <span className="text-start">{object.name}</span>
              <MaterialSymbol icon="navigate_next" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const { data: adapters } = useSavedAdaptersQuery();
  const { data: algorithms } = useSavedAlgorithmsQuery();
  const { data: problems } = useSavedProblemsQuery();
  const { data: visualizers } = useSavedVisualizersQuery();
  const { boxOptions } = useSandboxComponents();

  const groupedOptions = useMemo(() => {
    return groupOptionsByTag(boxOptions);
  }, [boxOptions]);

  return (
    <div className="flex flex-col max-w-4xl px-4 gap-8 mx-auto py-6">
      <div className="flex flex-col gap-4">
        <Heading variant="h2">Explore boxes</Heading>
        {groupedOptions.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <Heading variant="h3">{group.label}</Heading>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.options.map((option) => (
                <a
                  key={option.key}
                  className="bg-surface-high hover:bg-surface-higher transition rounded h-20 p-4 flex items-center justify-center font-semibold text-label"
                  href={`/playground?box=${option.value.key}`}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <Heading variant="h2">Your custom components</Heading>
        <SavedObjectsSection title="Adapters" objects={adapters ?? []} />
        <SavedObjectsSection title="Problems" objects={problems ?? []} />
        <SavedObjectsSection title="Algorithms" objects={algorithms ?? []} />
        <SavedObjectsSection title="Visualizers" objects={visualizers ?? []} />
      </div>
    </div>
  );
}
