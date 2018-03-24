/* @flow */

let babel: any;
let eslint: any;
let eslintConfig: any;

export async function getCodeCompiler() {
  if (!babel) {
    const [
      babelModule,
      eslintModule,
      eslintConfigModule,
      babelPluginDetective,
      babelPluginTransformAsyncGeneratorFunctions,
      babelPluginTransformObjectRestSpread,
      babelPluginTransformRuntime,
    ] = /* prettier-ignore */ await Promise.all([
      import(/* webpackChunkName: "compiler" */ 'babel-standalone'),
      import(/* webpackChunkName: "compiler" */ './eslint/eslint'),
      import(/* webpackChunkName: "compiler" */ './eslint/eslintConfig'),
      import(/* webpackChunkName: "compiler" */ 'babel-plugin-detective'),
      import(
        /* webpackChunkName: "compiler" */
        'babel-plugin-transform-async-generator-functions'
      ),
      import(
        /* webpackChunkName: "compiler" */
        'babel-plugin-transform-object-rest-spread'
      ),
      import(
        /* webpackChunkName: "compiler" */
        'babel-plugin-transform-runtime'
      ),
    ]);
    babel = babelModule;
    eslint = eslintModule;
    eslintConfig = eslintConfigModule;
    babel.registerPlugin('detective', babelPluginDetective);
    babel.registerPlugin(
      'transform-async-generator-functions',
      babelPluginTransformAsyncGeneratorFunctions,
    );
    babel.registerPlugin(
      'transform-object-rest-spread',
      babelPluginTransformObjectRestSpread,
    );
    babel.registerPlugin('transform-runtime', babelPluginTransformRuntime);
  }
  const linter = await getLinter();

  return (
    code: string,
  ):
    | { ok: true, code: string, dependencies: Array<string> }
    | { ok: false, errors: any } => {
    try {
      const errors = linter(code);
      if (errors.filter(error => error.severity === 2).length > 0) {
        return {
          ok: false,
          errors,
        };
      }
      const transform = babel.transform(code, {
        presets: ['latest'],
        plugins: [
          'transform-runtime',
          'transform-async-generator-functions',
          'transform-object-rest-spread',
        ],
      });
      const { code: compiledCode, metadata } = transform;

      const auth0_moduel_hacked_code = compiledCode.replace(
        "var _graphqlTools = require('graphql-tools')",
        `var _graphqlTools;
        try {
          _graphqlTools = require('launchpad-module').graphqlTools;
        } catch(e) {
          var _graphqlTools = require('graphql-tools');
        }
        `,
      );

      const dependencies: Array<string> = metadata.modules.imports.map(
        module => module.source,
      );
      return {
        ok: true,
        code: auth0_moduel_hacked_code,
        dependencies,
      };
    } catch (e) {
      return {
        ok: false,
        errors: e,
      };
    }
  };
}

export async function getLinter() {
  if (!eslint) {
    const [
      eslintModule,
      eslintConfigModule,
    ] = /* prettier-ignore */ await Promise.all([
      import(
        /* webpackChunkName: "compiler" */ './eslint/eslint'
      ),
      import(/* webpackChunkName: "compiler" */ './eslint/eslintConfig'),
    ]);
    eslint = eslintModule;
    eslintConfig = eslintConfigModule;
  }

  return (code: string): any => {
    return eslint.verify(code, eslintConfig.default);
  };
}

let prism: any;

export async function getPrismHighlighter(): Promise<
  (string, string) => string,
> {
  if (!prism) {
    prism = await import('prismjs');
    await import('prismjs/themes/prism.css');
  }
  return (code: string, language: string): string =>
    (prism.highlight(code, prism.languages[language]): string);
}
