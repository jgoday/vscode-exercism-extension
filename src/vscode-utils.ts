import * as vscode from 'vscode';

export const showInputBox = (opts: vscode.InputBoxOptions) => {
	return new Promise<string>((resolve, reject) => {
		vscode.window.showInputBox(opts)
			.then(r => {
				if (r) {
					resolve(r);
				}
				else {
					reject();
				}
			});
	});
}