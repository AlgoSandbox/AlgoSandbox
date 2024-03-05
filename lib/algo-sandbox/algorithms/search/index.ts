import aStarSearch from './a-star-environment';
import breadthFirstSearchEnvironment from './bfs-environment';
import depthFirstSearch from './dfs-environment';
import depthLimitedSearch from './dls-environment';
import iterativeDeepeningSearch from './ids-environment';
import uniformCostSearch from './ucs-environment';

export {
  aStarSearch as aStarEnvironment,
  breadthFirstSearchEnvironment as bfsEnvironment,
  depthFirstSearch as dfsEnvironment,
  depthLimitedSearch as dlsEnvironment,
  iterativeDeepeningSearch as idsEnvironment,
  uniformCostSearch as ucsEnvironment,
};
