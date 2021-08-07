module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};

// module.exports = {
//   // rest of config
//   plugins: [
//     [
//       "@babel/plugin-transform-react-jsx",
//       // {
//       //   "throwIfNamespace": true, // defaults to true
//       //   "runtime": "classic", // defaults to classic
//       //   "importSource": "react" // defaults to react
//       // }
//     ],
//     ["@babel/plugin-proposal-class-properties", { "loose": true }],
//     [
//       'babel-plugin-rewrite-require',
//       {
//         aliases: {
//           stream: 'readable-stream',
//         },
//       },
//     ],
//   ],
// };
