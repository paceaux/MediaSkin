import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';

const production = !process.env.ROLLUP_WATCH;

export default {
  banner: `// MediaSkin, copyright (c) by Frank M. Taylor and others
`,
  input: "src/main.js",
  output: {
      file: 'lib/mediaskin.js',
      format: 'umd'
  },
  name: "MediaSkin",
  plugins: [ 
    eslint(),
    babel(
      {
        exclude: 'node_modules/**'
      }
    )    
 ]
};
