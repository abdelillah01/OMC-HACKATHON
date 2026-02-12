module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin", // Ce plugin doit toujours être le dernier de la liste
    ],
  };
};
