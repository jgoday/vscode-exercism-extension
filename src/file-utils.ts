import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { executeProgramR, isWindows } from './exec-utils';

export const fileExistsSync = fs.existsSync;

export const fileExists = (filepath: string) => {
	return new Promise<boolean>((resolve, _) => {
		fs.exists(filepath, resolve);
	})
}

export const getUserHome = () => {
	return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

export const resolvePath = (relativePath: string) => {
	if (relativePath && relativePath.startsWith('~')) {
		return path.join(homedir(), relativePath.substring(1));
	}
	else {
		return path.resolve(relativePath);
	}
}

export const programExistsInPath = async (programName: string) => {
	const finder = isWindows()
		? 'where.exe'
		: 'which';
	const [out, _] = await executeProgramR(`${finder} ${programName}`);

	return out ? out.split('\n')[0].trim() : undefined;
}