import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { MaterialSymbol } from '@components/ui';
import Heading from '@components/ui/Heading';
import { DbSandboxObjectSaved, useSavedAlgorithmsQuery } from '@utils/db';
import { useSavedAdaptersQuery } from '@utils/db/adapters';
import { useSavedProblemsQuery } from '@utils/db/problems';
import { useSavedVisualizersQuery } from '@utils/db/visualizers';

type SavedObjectsSectionProps = {
  title: string;
  objects: Array<DbSandboxObjectSaved>;
};

function SavedObjectsSection({ objects, title }: SavedObjectsSectionProps) {
  const { setTab, selectedTabId } = useTabManager();

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
                setTab({
                  id: selectedTabId,
                  type: 'editor',
                  label: object.name,
                  data: {
                    object,
                  },
                });
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

export default function NewTabPage() {
  const { setTab, selectedTabId } = useTabManager();
  const { data: adapters } = useSavedAdaptersQuery();
  const { data: algorithms } = useSavedAlgorithmsQuery();
  const { data: problems } = useSavedProblemsQuery();
  const { data: visualizers } = useSavedVisualizersQuery();
  const { builtInBoxOptions } = useBuiltInComponents();

  return (
    <div className="flex flex-col max-w-4xl px-4 gap-8 mx-auto py-6">
      <div className="flex flex-col gap-4">
        <Heading variant="h2">Explore boxes</Heading>
        {builtInBoxOptions.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <Heading variant="h3">{group.label}</Heading>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.options.map((option) => (
                <button
                  key={option.key}
                  className="bg-surface-high hover:bg-surface-higher transition rounded h-20 flex items-center justify-center font-semibold text-label"
                  onClick={() => {
                    setTab({
                      id: selectedTabId,
                      type: 'box',
                      label: option.label,
                      data: { box: option.value },
                    });
                  }}
                >
                  {option.label}
                </button>
              ))}
              {Array.from({ length: 10 }, (_, i) => i).map((i) => (
                <div
                  key={i}
                  className="bg-surface rounded h-20 flex items-center justify-center text-muted font-semibold"
                >
                  Coming soon
                </div>
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
