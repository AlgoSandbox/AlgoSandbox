import { ComponentTag } from '@algo-sandbox/core';
import { VisualizationRenderer } from '@algo-sandbox/react-components';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { Chip, MaterialSymbol } from '@components/ui';
import Heading from '@components/ui/Heading';
import { DbSandboxObjectSaved, useSavedAlgorithmsQuery } from '@utils/db';
import { useSavedAdaptersQuery } from '@utils/db/adapters';
import { useSavedProblemsQuery } from '@utils/db/problems';
import { useSavedVisualizersQuery } from '@utils/db/visualizers';
import getSandboxObjectConfig from '@utils/getSandboxObjectConfig';
import usePreviewVisualization from '@utils/usePreviewVisualization';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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

function BoxOption({
  box,
  label,
  tags,
}: {
  box: DbSandboxObjectSaved<'box'>;
  label: string;
  tags: Array<ComponentTag>;
}) {
  const [hovered, setHovered] = useState(false);
  const visualization = usePreviewVisualization(box, {
    playAnimation: hovered,
  });

  return (
    <a
      key={box.key}
      onMouseEnter={() => setHovered(true)}
      onFocus={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onBlur={() => setHovered(false)}
      className="group bg-surface-high border hover:text-accent focus:text-accent hover:border-accent focus:border-accent hover:bg-surface-higher overflow-clip flex flex-col transition rounded font-semibold text-on-surface"
      href={`/playground?box=${box.key}`}
    >
      <div className="p-4 flex flex-1 flex-col gap-2">
        <span className="text-lg font-semibold tracking-tight">{label}</span>
        <div className="flex flex-wrap gap-2 text-label">
          {tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </div>
      <div className="bg-surface h-56 group-hover:bg-surface-high group-focus:bg-surface-high flex items-center justify-center relative overflow-clip">
        {visualization && (
          <VisualizationRenderer
            className="w-full h-full absolute pointer-events-none"
            visualization={visualization}
            zoom={0.5}
          />
        )}
      </div>
    </a>
  );
}

export default function DashboardPage() {
  const { data: adapters } = useSavedAdaptersQuery();
  const { data: algorithms } = useSavedAlgorithmsQuery();
  const { data: problems } = useSavedProblemsQuery();
  const { data: visualizers } = useSavedVisualizersQuery();
  const { boxOptions } = useSandboxComponents();

  const boxOptionsWithTags = useMemo(
    () =>
      boxOptions.map((option) => ({
        ...option,
        tags: getSandboxObjectConfig(option.value).tags,
      })),
    [boxOptions],
  );

  const allTags = useMemo(
    () =>
      _(boxOptionsWithTags.flatMap((option) => option.tags))
        .uniq()
        .sort()
        .filter((tag) => tag !== 'box')
        .value(),
    [boxOptionsWithTags],
  );

  const [selectedTags, setSelectedTags] = useState<Array<ComponentTag>>([]);

  const filteredBoxOptions = useMemo(() => {
    if (selectedTags.length === 0) {
      return boxOptionsWithTags;
    }

    return boxOptionsWithTags.filter((option) =>
      selectedTags.some((tag) => option.tags.includes(tag)),
    );
  }, [boxOptionsWithTags, selectedTags]);

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col max-w-7xl flex-1 px-4 gap-8 py-6">
        <div className="flex flex-col gap-2">
          <Heading variant="h2">Explore boxes</Heading>
          <div className="flex flex-wrap gap-2 sticky top-0 py-4 bg-canvas z-10">
            {allTags.map((tag) => (
              <Chip
                selectable
                selected={selectedTags.includes(tag)}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                key={tag}
              >
                {tag}
              </Chip>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoxOptions.map((option) => (
              <BoxOption
                key={option.key}
                box={option.value}
                label={option.label}
                tags={option.tags}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Heading variant="h2">Your custom components</Heading>
          <SavedObjectsSection title="Adapters" objects={adapters ?? []} />
          <SavedObjectsSection title="Problems" objects={problems ?? []} />
          <SavedObjectsSection title="Algorithms" objects={algorithms ?? []} />
          <SavedObjectsSection
            title="Visualizers"
            objects={visualizers ?? []}
          />
        </div>
      </div>
    </div>
  );
}
