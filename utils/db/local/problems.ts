import { DbProblem, DbProblemSaved } from '..';
import { saveSandboxObject } from '.';

const savedListKey = 'sandbox:problems:custom';

function getSavedProblemKeys() {
  const savedProblemKeysRaw = localStorage.getItem(savedListKey);

  if (savedProblemKeysRaw === null) {
    return [];
  }

  return JSON.parse(savedProblemKeysRaw) as Array<string>;
}

export function getSavedProblems() {
  const savedProblemKeys = getSavedProblemKeys();

  return savedProblemKeys
    .map((key) => localStorage.getItem(key))
    .filter((item) => item !== null)
    .map((item) => JSON.parse(item!)) as Array<DbProblemSaved>;
}

export function addSavedProblem(problem: DbProblem) {
  const savedProblem = saveSandboxObject(problem);
  const problemKeys = getSavedProblemKeys();
  const newProblemKeys = [...problemKeys, savedProblem.key];
  localStorage.setItem(savedListKey, JSON.stringify(newProblemKeys));

  return savedProblem;
}

export function setSavedProblem(problem: DbProblemSaved) {
  const savedProblem = saveSandboxObject(problem);

  return savedProblem;
}

export function removeSavedProblem(problem: DbProblemSaved) {
  localStorage.removeItem(problem.key);

  const problemKeys = getSavedProblemKeys();
  const newProblemKeys = problemKeys.filter((key) => key !== problem.key);
  localStorage.setItem(savedListKey, JSON.stringify(newProblemKeys));
}
