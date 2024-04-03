import * as adapters from '@algo-sandbox/adapters';
import * as algorithms from '@algo-sandbox/algorithms';
import * as core from '@algo-sandbox/core';
import * as problems from '@algo-sandbox/problems';
import * as states from '@algo-sandbox/states';
import * as utils from '@algo-sandbox/utils';
import * as immer from 'immer';
import * as lodash from 'lodash';
import * as random from 'random';
import * as zod from 'zod';

export default function getLibraries() {
  return {
    '@algo-sandbox/adapters': adapters,
    '@algo-sandbox/algorithms': algorithms,
    '@algo-sandbox/core': core,
    '@algo-sandbox/problems': problems,
    '@algo-sandbox/states': states,
    '@algo-sandbox/utils': utils,
    random: random,
    immer: immer,
    lodash: lodash,
    zod: zod,
  };
}
