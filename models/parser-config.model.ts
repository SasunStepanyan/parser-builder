export interface IParserConfig {
  readonly project: string;
  readonly prefix: string;
  readonly buildCommand: string;
}

export class ParserConfig implements IParserConfig {
  public readonly project: string;
  public readonly prefix: string;
  public readonly buildCommand: string;

  constructor(json: any) {
    this.validateConfig(json);
    this.project = json.project;
    this.prefix = json.prefix;
    this.buildCommand = json['build-command'] || 'build';
  }

  private validateConfig(json: any) {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid config file');
    }
    this.validateProjectName(json.project);
    this.validatePrefix(json.prefix);
    this.validateBuildCommand(json['build-command']);
  }

  private validateProjectName(projectName: string) {
    if (!projectName || typeof projectName !== 'string' || !projectName.length) {
      throw new Error('Invalid parameter(project) in parser config');
    }
  }

  private validatePrefix(prefix: string) {
    if (!prefix || typeof prefix !== 'string' || !prefix.length) {
      throw new Error('Invalid parameter(prefix) in parser config');
    }
  }

  private validateBuildCommand(command: string) {
    if (typeof command === 'string' && !command.length) {
      throw new Error('Invalid parameter(build-command) in parser config');
    }
  }
}
