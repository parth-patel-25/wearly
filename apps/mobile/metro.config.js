const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot, {
  // Monorepo: watch the whole workspace so edits in ../../packages are picked
  // up. Hierarchical lookup stays ENABLED — Bun's isolated store relies on it
  // to find each package's siblings under node_modules/.bun/*.
  watchFolders: [workspaceRoot],
});

// Keep React and the styling runtime resolving to a single copy. React is
// pinned to one version across the whole workspace, so every symlink lands on
// the same store entry.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  uniwind: path.resolve(projectRoot, "node_modules/uniwind"),
};

// withUniwindConfig must be the OUTERMOST wrapper.
module.exports = withUniwindConfig(config, {
  // Must be a relative path string, not path.resolve().
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
