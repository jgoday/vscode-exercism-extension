import {exec} from 'child_process';

export const sleep = async (msecs: number) =>
	await new Promise((resolve) => {
		setTimeout(() => { resolve(); }, msecs);
    });

export const executeProgram = (cmd: string) => {
    return new Promise<boolean>((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(stderr);
            }
            else {
                resolve(true);
            }
		});
    });
}

export const executeProgramR = (cmd: string) => {
    return new Promise<[string, string]>((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err.message);
            }
            else {
                resolve([stdout, stderr]);
            }
		});
    });
}