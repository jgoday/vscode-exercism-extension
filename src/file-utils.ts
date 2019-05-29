import * as fs from 'fs';

export const fileExistsSync = fs.existsSync;

export const fileExists = (filepath: string) => {
	return new Promise<boolean>((resolve, _) => {
		fs.exists(filepath, resolve);
	})
}

export const getUserHome = () => {
	return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}