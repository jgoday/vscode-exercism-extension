import { fileExists, getUserHome, resolvePath, programExistsInPath } from './file-utils';
import { executeProgramR, executeProgram, isWindows } from './exec-utils';

export interface IEnviroment {
    get: <T>(name: string) => T | undefined;
    set: <T>(name: string, value: T) => void;
    ask: (text: string, title?: string) => Promise<string>;
    showError: (error: string) => void;
}

export class Reader<T> {
    public static create<T>(arg: T) {
        return new Reader(arg);
    }

    public constructor(private value: T) {}

    public async run<A>(fn: (_: T, ...args: any) => A, ...args: any) {
        return fn(this.value, ...args);
    }
}

export const getExercismAppPath = async (conf: IEnviroment) => {
    const exercismApp = conf.get<string>('app.path');
    if (!exercismApp) {
        // search in current path
        const defaultAppName = isWindows
            ? 'exercism.exe'
            : 'exercism';
        const defaultAppPath = await programExistsInPath(defaultAppName);

        if (defaultAppPath) {
            return defaultAppName;
        }
        else {
            const res = await conf.ask('Exercism client app not found. Please, enter full path: ');
            const apppath = resolvePath(res);
            const isValid = await fileExists(apppath || 'notvalid');

            if (isValid) {
                conf.set('app.path', apppath);
                return apppath;
            }
            else {
                conf.showError(`'${apppath}' is not a valid path`);
                return undefined;
            }
        }
    }
    else {
        return exercismApp;
    }
};

export const workspaceHasExercismMetadata = (_: IEnviroment, workspace: string) => {
    return fileExists(workspace);
}

export const getExercismConfigPath = async (env: IEnviroment, apppath: string) => {
	try {
		const [_, out] = await executeProgramR(`${apppath} configure -s`);
		const r = new RegExp('\dir:(.*?)\\n');
		const dir = r.exec(out)![1].trim();

		return dir;
	}
	catch (e) {
		env.showError(e);
		return undefined;
	}
}

export const requestToken = async (env: IEnviroment, apppath: string) => {
	const token = await env.ask(
        'Token',
        'Exercism client is not configured. Please, insert your client token.');

	const home = getUserHome();
	const r = await executeProgram(`${apppath} configure -t ${token} -w ${home}/Exercism`);
	return r;
}

export const ensureToken = async (env: IEnviroment, apppath: string) => {
	const path = await getExercismConfigPath(env, apppath);
	const userConfigFile = `${path}/user.json`;
	const exist = await fileExists(userConfigFile)
	if (path && exist) {
		const config = require(userConfigFile);

		if (!config.token) {
			return await requestToken(env, apppath);
		}
	}
	else {
		return await requestToken(env, apppath);
	}

	return true;
}