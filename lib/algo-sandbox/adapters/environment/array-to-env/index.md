# Array to environment

Converts an array into an environment where the initial state is the given array. The transition function for each array state produces a resultant array after making an adjacent-pair swap. The reward is the increase in closeness to sortedness. This creates a state space containing all permutations of the array.

> Note: This adapter is created to demonstrate the flexibility of AlgoSandbox, by allowing arrays to be sorted using search algorithms.
