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

// Monorepo packages built with `moduleResolution: "node16"` import their
// siblings with an explicit `.js` extension (`./environment.js`) for Node's
// sake — but those files on disk are `.ts`. Metro's default resolver fails on
// them. Keep the app's resolution untouched; only when the default fails and
// the specifier ends in `.js`, retry without it so Metro finds the `.ts`.
const defaultResolveRequest = config.resolver.resolveRequest;
const resolveRequest =
  defaultResolveRequest ?? ((context, moduleName, platform) => context.resolveRequest(context, moduleName, platform));
config.resolver.resolveRequest = (context, moduleName, platform) => {
  try {
    return resolveRequest(context, moduleName, platform);
  } catch (error) {
    if (moduleName.endsWith(".js")) {
      return resolveRequest(context, moduleName.slice(0, -".js".length), platform);
    }
    throw error;
  }
};

// withUniwindConfig must be the OUTERMOST wrapper.
module.exports = withUniwindConfig(config, {
  // Must be a relative path string, not path.resolve().
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});
