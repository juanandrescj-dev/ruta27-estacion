// Conventional Commits (§12). El hook commit-msg de Husky valida cada mensaje.
/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
};
