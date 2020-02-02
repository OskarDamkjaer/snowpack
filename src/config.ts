import {cosmiconfigSync} from 'cosmiconfig';
import {Validator} from 'jsonschema';
import {merge} from 'lodash';

export interface SnowpackConfig {
  options: {
    babel?: boolean;
    clean?: boolean;
    dest?: string;
    exclude?: string[];
    externalPackage?: string[];
    include?: string[];
    nomodule?: string;
    nomoduleOutput?: string;
    noSourceMap?: boolean;
    optimize?: boolean;
    remotePackage?: string[];
    remoteUrl?: string;
    strict?: boolean;
  };
  webDependencies: string[];
}

const defaultConfig: SnowpackConfig = {
  options: {
    clean: false,
    dest: 'web_modules',
    exclude: ['**/__tests__/*', '**/*.@(spec|test).@(js|mjs)'],
    noSourceMap: false,
    nomoduleOutput: 'app.nomodule.js',
    optimize: false,
    remoteUrl: 'https://cdn.pika.dev',
    strict: false,
  },
  webDependencies: [],
};

const schema = {
  id: '/config',
  type: 'object',
  properties: {
    options: {
      type: 'object',
      properties: {
        babel: {type: 'boolean'},
        clean: {type: 'boolean'},
        dest: {type: 'string'},
        exclude: {type: 'array', items: {type: 'string'}},
        externalPackage: {type: 'array', items: {type: 'string'}},
        include: {type: 'array', items: {type: 'string'}},
        nomodule: {type: 'string'},
        nomoduleOutput: {type: 'string'},
        noSourceMap: {type: 'boolean'},
        optimize: {type: 'boolean'},
        remotePackage: {type: 'array', items: {type: 'string'}},
        remoteUrl: {type: 'string'},
        strict: {type: 'boolean'},
      },
      required: [],
    },
    webDependencies: {type: 'array', items: {type: 'string'}},
  },
};

export default async function loadConfig(cliFlags?: SnowpackConfig) {
  const explorerSync = cosmiconfigSync('snowpack');
  const result = explorerSync.search(); // search for snowpack config
  const config: SnowpackConfig = result.config;

  // user has no config
  if (!config || result.isEmpty) {
    return cliFlags ? merge(defaultConfig, cliFlags) : defaultConfig;
  }

  // validate against schema; throw helpful user if invalid
  const {validate} = new Validator();
  validate(config, schema, {throwError: true});

  // if valid, apply config over defaults
  const mergedConfig = merge(defaultConfig, config);

  // if CLI flags present, return those as overrides
  return cliFlags ? merge(mergedConfig, cliFlags) : mergedConfig;
}
