import { join } from 'path';
import { spawn } from 'child_process';
import { platform } from 'os';
import { ncp } from 'ncp';
import { sync as removeSync} from 'rimraf';
import { ParserTransform } from '../utils/utils';
import { CONFIG_PATH } from '../config/constants';
import { IParserConfig, ParserConfig } from '../models/parser-config.model';

export default async function(): Promise<void> {

  // Get Parser Config
  const parserConfig: IParserConfig = await getConfig();
  const { project, prefix, buildCommand } = parserConfig;

  // Get copies project name
  const copiedProjectName = `${project}-deploy`;

  // Remove node_modules
  removeSync(join(process.cwd(), project, 'node_modules'));

  // Remove existing copy
  removeSync(join(process.cwd(), copiedProjectName));

  // Copy project
  ncp(join(process.cwd(), project), copiedProjectName, {
    // Transform for removing classes
    transform: (read: NodeJS.ReadableStream, write: NodeJS.WritableStream): void => {
      if ((read as any).path.includes('.html')) {
        const parserTransform = new ParserTransform(prefix);
        read.pipe(parserTransform).pipe(write);
      } else {
        read.pipe(write);
      }
    },
    // Filter "package-lock.json" to avoid errors during insatllation/building
    filter: (filename: string): boolean => !filename.includes('package-lock'),
    errs: process.stderr,
    stopOnErr: true
  }, (err: Error): void => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    // Run "npm install" command
    const npmCmd = platform().startsWith('win') ? 'npm.cmd' : 'npm';
    spawn(npmCmd, ['install'], {
      cwd: join(process.cwd(), copiedProjectName),
      stdio: 'inherit'
    }).on('exit', (installExitCode: number): void => {
      if (installExitCode) {
        console.error(`Unexpected error during "npm install"`);
        return process.exit(installExitCode);
      }

      // Run "npm run [build-command]" command
      spawn(npmCmd, ['run', buildCommand], {
        cwd: join(process.cwd(), copiedProjectName),
        stdio: 'inherit'
      }).on('exit', (buildExitCode: number): void => {
        if (buildExitCode) {
          console.error(`Unexpected error during "npm run ${buildCommand}"`);
          return process.exit(buildExitCode);
        }

        console.log('done');
      });
    });
  });
}

async function getConfig(): Promise<IParserConfig> {
  try {
    const json = await import(join(process.cwd(), CONFIG_PATH));
    return new ParserConfig(json);
  } catch (err) {
    console.log(err);
    return process.exit(1);
  }
}
