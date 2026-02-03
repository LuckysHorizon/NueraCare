const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Handle web-only dependencies that Clerk needs but React Native doesn't use
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Return empty module for web-only dependencies
  if (
    moduleName === "react-dom" ||
    moduleName === "expo-auth-session/build/providers/Implicit" ||
    moduleName === "expo-auth-session/build/SessionUrl"
  ) {
    return {
      type: "empty",
    };
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

