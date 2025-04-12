module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Remove the reanimated plugin for now since we don't use it in tests
  };
};