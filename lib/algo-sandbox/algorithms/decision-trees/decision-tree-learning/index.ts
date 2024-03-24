import { createAlgorithm, createState } from '@algo-sandbox/core';
import { decisionTreeTrainingSetState } from '@algo-sandbox/problems/decision-trees';
import { nodeGraphVisualizerInput } from '@algo-sandbox/states';
import { mapKeys, maxBy } from 'lodash';
import { z } from 'zod';

const pseudocode = `def DTL(examples, attributes, default):
  tree, subtreeData = DTLStep(examples, attributes, default)
  toVisit = subtreeData
  while toVisit is not empty:
    subtreeData = toVisit.takeFirst()
    tree, newSubtreeData = DTLStep(subtreeData.examples, subtreeData.attributes, subtreeData.default)
    add a branch to tree with label v_i and subtree subtree
    toVisit.append(newSubtrees)
  return tree

def DTLStep(examples, attributes, default):
  if examples is empty: return default, []
  if examples have the same classification:
    return classification, []
  if attributes is empty:
    return mode(examples), []
  best = choose_attribute(attributes, examples)
  tree = a new decision tree with root best
  subtrees = []
  for each value v_i of best:
    examples = {rows in examples with best = v_i}
    subtrees.append((examples, attributes - best, mode(examples))
  return tree, subtrees
`;

const treeShape = nodeGraphVisualizerInput.shape.extend({
  nodeDepths: z.record(z.number()),
});

type Tree = z.infer<typeof treeShape>;

const decisionTreeLearningState = createState(
  'Decision tree state',
  z.object({
    decisionTree: treeShape,
    examples: decisionTreeTrainingSetState.shape.shape.examples,
    attributes: decisionTreeTrainingSetState.shape.shape.attributes,
    defaultClassification: z.string(),
  }),
);

function createTreeWithRoot(label: string): Tree {
  const createElement = eval(`() => {
    const element = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text',
    );

    element.textContent = ${JSON.stringify(label)};
    element.setAttribute('fill', 'rgb(var(--color-on-surface))');

    return element;
  };`);

  return {
    nodes: [{ id: label, createElement }],
    edges: [],
    nodeDepths: { [label]: 0 },
  };
}

function addSubTreeToNode({
  tree,
  nodeId,
  subTree,
  edgeLabel,
}: {
  tree: Tree;
  nodeId: string;
  subTree: Tree;
  edgeLabel: string;
}) {
  const subTreeRoot = Object.keys(subTree.nodeDepths).find(
    (node) => subTree.nodeDepths[node] === 0,
  );

  if (subTreeRoot === undefined) {
    throw new Error('Subtree root not found');
  }

  const rootNodeDepth = tree.nodeDepths[nodeId];

  const newNodeDepths: Record<string, number> = {
    ...tree.nodeDepths,
  };

  const transformedSubTree: Tree = {
    nodes: subTree.nodes.map((node) => ({
      ...node,
      id: `${nodeId}-${edgeLabel}-${node.id}`,
    })),
    edges: subTree.edges.map((edge) => ({
      ...edge,
      source: `${nodeId}-${edgeLabel}-${edge.source}`,
      target: `${nodeId}-${edgeLabel}-${edge.target}`,
    })),
    nodeDepths: mapKeys(
      subTree.nodeDepths,
      (_, key) => `${nodeId}-${edgeLabel}-${key}`,
    ),
  };

  for (const [node, depth] of Object.entries(transformedSubTree.nodeDepths)) {
    newNodeDepths[node] = depth + rootNodeDepth + 1;
  }

  const transformedSubTreeRoot = `${nodeId}-${edgeLabel}-${subTreeRoot}`;

  const newNodes = [...tree.nodes, ...transformedSubTree.nodes];
  const newEdges = [...tree.edges, ...transformedSubTree.edges];
  newEdges.push({
    source: nodeId,
    target: transformedSubTreeRoot,
    label: edgeLabel,
    isArrow: true,
  });

  const newTree: Tree = {
    nodes: newNodes,
    edges: newEdges,
    nodeDepths: newNodeDepths,
  };

  return newTree;
}

function mode(array: Array<string>): string {
  const counts: Record<string, number> = {};

  for (const value of array) {
    if (counts[value] === undefined) {
      counts[value] = 0;
    }
    counts[value]++;
  }

  let maxCount = 0;
  let maxCountValue = '';
  for (const value in counts) {
    if (counts[value] > maxCount) {
      maxCount = counts[value];
      maxCountValue = value;
    }
  }

  return maxCountValue;
}

const decisionTreeLearning = createAlgorithm({
  name: 'Decision tree learning',
  accepts: decisionTreeTrainingSetState,
  outputs: decisionTreeLearningState,
  pseudocode,
  createInitialState: ({ attributes, examples }) => {
    return {
      decisionTree: {
        nodes: [],
        edges: [],
        nodeDepths: {},
      },
      attributes,
      examples,
      defaultClassification: 'unknown classification',
    };
  },
  *runAlgorithm({ line, state, problemState: { attributes, examples } }) {
    type Attributes = typeof attributes;
    type Examples = typeof examples;
    // create frontier (priority queue based on cost)
    // create visited

    function chooseAttribute(
      attributes: Attributes,
      examples: Examples,
    ): string {
      // Choose attribute with the highest information gain

      function getInformationGain(
        attribute: string,
        examples: Examples,
      ): number {
        const attributeValues = Array.from(
          new Set(examples.map((example) => example.attributes[attribute])),
        );

        const entropy = attributeValues.reduce((acc, value) => {
          const examplesWithAttributeValue = examples.filter(
            (example) => example.attributes[attribute] === value,
          );

          const classificationCounts: Record<string, number> = {};

          for (const example of examplesWithAttributeValue) {
            if (classificationCounts[example.classification] === undefined) {
              classificationCounts[example.classification] = 0;
            }
            classificationCounts[example.classification]++;
          }

          const valueEntropy = Object.values(classificationCounts).reduce(
            (acc, count) => {
              const p = count / examplesWithAttributeValue.length;
              return acc - p * Math.log2(p);
            },
            0,
          );

          return (
            acc +
            (examplesWithAttributeValue.length / examples.length) * valueEntropy
          );
        }, 0);

        return entropy;
      }

      const attributeInformationGains = attributes.map((attribute) => ({
        attribute,
        informationGain: getInformationGain(attribute, examples),
      }));

      return maxBy(attributeInformationGains, (x) => x.informationGain)!
        .attribute;
    }

    function* DTLStep(
      examples: Examples,
      attributes: Attributes,
      defaultClassification: string,
    ): Generator<
      ReturnType<typeof line>,
      {
        tree: Tree;
        subTrees: Array<{
          attributeValue: string;
          examples: Examples;
          attributes: Attributes;
          defaultClassification: string;
        }>;
      }
    > {
      // If examples is empty, return default
      if (examples.length === 0) {
        yield line(
          12,
          `No examples, return default = ${defaultClassification}`,
        );

        return {
          tree: createTreeWithRoot(defaultClassification),
          subTrees: [],
        };
      }

      // If examples have the same classification, return classification
      const classification = examples[0].classification;
      if (
        examples.every((example) => example.classification === classification)
      ) {
        yield line(
          13,
          14,
          `All examples have the same classification. Returning ${classification}`,
        );
        return {
          tree: createTreeWithRoot(classification),
          subTrees: [],
        };
      }

      // If attributes is empty, return mode(examples)
      if (attributes.length === 0) {
        const modeClassification = mode(
          examples.map((example) => example.classification),
        );

        yield line(
          15,
          16,
          `No attributes, return mode(examples) = ${modeClassification}`,
        );

        return {
          tree: createTreeWithRoot(modeClassification),
          subTrees: [],
        };
      }

      const bestAttribute = chooseAttribute(attributes, examples);
      const tree = createTreeWithRoot(bestAttribute);
      const bestAttributeValues = Array.from(
        new Set(examples.map((example) => example.attributes[bestAttribute])),
      );

      const subTrees = bestAttributeValues.map((v_i) => {
        const examplesWithAttributeValue = examples.filter(
          (example) => example.attributes[bestAttribute] === v_i,
        );

        return {
          attributeValue: v_i,
          examples: examplesWithAttributeValue,
          attributes: attributes.filter((a) => a !== bestAttribute),
          defaultClassification: mode(
            examples.map((example) => example.classification),
          ),
        };
      });

      yield line(
        23,
        `Return tree with node = best attribute: ${bestAttribute} with sub-tree values ${bestAttributeValues}`,
      );

      return {
        tree,
        subTrees,
      };
    }

    yield line(2, 'Initialize tree');

    const dtlStep = DTLStep(
      state.examples,
      state.attributes,
      state.defaultClassification,
    );

    let value = dtlStep.next();
    while (!value.done) {
      yield value.value;
      value = dtlStep.next();
    }

    const { tree, subTrees } = value.value;

    state.decisionTree = tree;

    const treeRoot = Object.keys(tree.nodeDepths).find(
      (node) => tree.nodeDepths[node] === 0,
    )!;

    const toVisit = subTrees.map((subTree) => ({
      ...subTree,
      parentId: treeRoot,
    }));

    while (toVisit.length > 0) {
      const subTreeData = toVisit.shift()!;

      const dtlStep = DTLStep(
        subTreeData.examples,
        subTreeData.attributes,
        subTreeData.defaultClassification,
      );

      let value = dtlStep.next();
      while (!value.done) {
        yield value.value;
        value = dtlStep.next();
      }

      const { tree: subTree, subTrees: newSubTrees } = value.value;

      const subTreeRootId = Object.keys(subTree.nodeDepths).find(
        (node) => subTree.nodeDepths[node] === 0,
      )!;

      const newTree = addSubTreeToNode({
        tree: state.decisionTree,
        nodeId: subTreeData.parentId,
        subTree,
        edgeLabel: subTreeData.attributeValue,
      });

      const nodeId =
        subTreeData.parentId === ''
          ? subTreeRootId
          : `${subTreeData.parentId}-${subTreeData.attributeValue}-${subTreeRootId}`;

      state.decisionTree = newTree;

      toVisit.push(
        ...newSubTrees.map((subTree) => ({ ...subTree, parentId: nodeId })),
      );

      yield line(4);
    }
    return true;
  },
});

export default decisionTreeLearning;
