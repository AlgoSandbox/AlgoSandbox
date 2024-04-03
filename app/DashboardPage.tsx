import { ComponentTag } from '@algo-sandbox/core';
import { VisualizationRenderer } from '@algo-sandbox/react-components';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { Badge, Button, Chip, Input, MaterialSymbol } from '@components/ui';
import Checkbox from '@components/ui/Checkbox';
import { Drawer, DrawerContent, DrawerTrigger } from '@components/ui/Drawer';
import Heading, { HeadingContent } from '@components/ui/Heading';
import { DbSandboxObjectSaved, useSavedAlgorithmsQuery } from '@utils/db';
import { useSavedAdaptersQuery } from '@utils/db/adapters';
import { useSavedProblemsQuery } from '@utils/db/problems';
import { useSavedVisualizersQuery } from '@utils/db/visualizers';
import getSandboxObjectConfig from '@utils/getSandboxObjectConfig';
import { useBreakpoint } from '@utils/useBreakpoint';
import usePreviewVisualization from '@utils/usePreviewVisualization';
import clsx from 'clsx';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

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
function useInMiddleOfScreen(
  ref: RefObject<HTMLElement>,
  options?: { enabled?: boolean },
) {
  const { enabled = true } = options ?? {};
  const [isIntersecting, setIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    observer.current = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      {
        root: null,
        rootMargin: '-100px 0px -45% 0px',
        threshold: 0.5,
      },
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!ref.current || !enabled) {
      return;
    }
    observer.current?.observe(ref.current);
    return () => observer.current?.disconnect();
  }, [enabled, observer, ref]);

  return isIntersecting;
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
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  const { isMd } = useBreakpoint('md');
  const isMobile = !isMd;

  const inMiddleOfScreen = useInMiddleOfScreen(ref, { enabled: isMobile });

  const visualization = usePreviewVisualization(box, {
    playAnimation: hovered || focused || (isMobile && inMiddleOfScreen),
  });

  return (
    <a
      ref={ref}
      key={box.key}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
      }}
      onTouchStart={() => {
        ref.current?.focus({ preventScroll: true });
      }}
      className={clsx(
        'group bg-surface-high border hover:text-accent focus:text-accent hover:border-accent focus:border-accent hover:bg-surface-higher overflow-clip flex flex-col transition rounded font-semibold text-on-surface',
        isMobile && inMiddleOfScreen && 'border-primary',
      )}
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

  const [boxQuery, setBoxQuery] = useState('');

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
    const query = boxQuery.toLowerCase();

    // query token can be either in tag or in label
    const boxOptionsMatchingQuery = (() => {
      if (query === '') {
        return boxOptionsWithTags;
      }

      return boxOptionsWithTags.filter((option) => {
        const queryTokens = query.split(' ');
        return queryTokens.every((token) => {
          const label = option.label.toLowerCase();
          const tags = option.tags.join(' ').toLowerCase();
          return label.includes(token) || tags.includes(token);
        });
      });
    })();

    if (selectedTags.length === 0) {
      return boxOptionsMatchingQuery;
    }

    return boxOptionsMatchingQuery.filter((option) =>
      selectedTags.every((tag) => option.tags.includes(tag)),
    );
  }, [boxOptionsWithTags, boxQuery, selectedTags]);

  const [showBoxFilterDialog, setShowBoxFilterDialog] = useState(false);

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col max-w-7xl flex-1 px-4 gap-8 py-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 py-2 sticky top-0 bg-canvas z-10">
            <div className="flex justify-between">
              <Heading variant="h2">Explore boxes</Heading>
              <Drawer
                open={showBoxFilterDialog}
                onOpenChange={setShowBoxFilterDialog}
              >
                <DrawerTrigger asChild>
                  <Badge
                    content={selectedTags.length}
                    visible={selectedTags.length > 0}
                  >
                    <Button
                      className="md:hidden"
                      label={
                        selectedTags.length === 0
                          ? 'Filter boxes'
                          : `Filter boxes (${selectedTags.length})`
                      }
                      hideLabel
                      icon={<MaterialSymbol icon="filter_list" />}
                      variant="filled"
                    />
                  </Badge>
                </DrawerTrigger>
                <DrawerContent className="flex flex-col items-stretch p-4 gap-2">
                  <Heading variant="h4">Filter boxes by tag</Heading>
                  <HeadingContent>
                    {allTags.map((tag) => (
                      <Checkbox
                        className="w-full"
                        checked={selectedTags.includes(tag)}
                        onChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(
                              selectedTags.filter((t) => t !== tag),
                            );
                          }
                        }}
                        key={tag}
                        label={tag}
                      />
                    ))}
                    <div className="flex gap-2">
                      <Button
                        label="Done"
                        onClick={() => setShowBoxFilterDialog(false)}
                        variant="primary"
                      />
                      <Button
                        label="Clear all"
                        onClick={() => setSelectedTags([])}
                        disabled={selectedTags.length === 0}
                        variant="filled"
                      />
                    </div>
                  </HeadingContent>
                </DrawerContent>
              </Drawer>
            </div>
            <Input
              label="Search boxes"
              hideLabel
              placeholder="Search boxes..."
              type="search"
              value={boxQuery}
              onChange={(e) => setBoxQuery(e.target.value)}
            />
            <div className="hidden md:flex flex-wrap gap-2">
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
