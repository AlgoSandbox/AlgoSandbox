# Array sorting with UCS

This is an experimental box that allows you to sort an array using the Uniform Cost Search algorithm.

The transition function for each array state produces a resultant array after making an adjacent-pair swap. The reward is the increase in closeness to sortedness. This creates a state space containing all permutations of the array, which will be traversed using UCS to find the sorted array.

> Note: This box is experimental and may run poorly on large arrays. It is created to demonstrate the flexibility of AlgoSandbox.
