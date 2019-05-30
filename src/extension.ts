// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { executeProgram, executeProgramR, sleep } from './exec-utils';
import { IEnviroment, Reader, getExercismAppPath, ensureToken, workspaceHasExercismMetadata } from './exercism';
import { showInputBox } from './vscode-utils';

export function activate(context: vscode.ExtensionContext) {
	const env = Reader.create<IEnviroment>({
		get: <T>(name: string) =>
			vscode.workspace.getConfiguration('exercism').get(name),
		set: <T>(name: string, value: T) =>
			vscode.workspace.getConfiguration('exercism').update(name, value, vscode.ConfigurationTarget.Global),
		ask: (text: string, title?: string) => showInputBox({
			prompt: title,
			placeHolder: text
		}),
		showError: (error: string) => vscode.window.showErrorMessage(error)
	});


	const fetchCommand = vscode.commands.registerCommand('extension.exercism.fetch', async () => {
		const exercismApp = await env.run(getExercismAppPath);

		if (exercismApp && await env.run(ensureToken, exercismApp)) {
			const exerciseName = await showInputBox({
				placeHolder: 'Track/Exercise name'
			});
			const [track, name] = exerciseName.split('/');
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Downloading exercise ${name}`
			}, async (progress) => {
				await sleep(1000);
				progress.report({});
				try {
					const [out, _] = await executeProgramR(
						`${exercismApp} download --track ${track} --exercise ${name}`);

					vscode.commands.executeCommand(
						'vscode.openFolder',
						vscode.Uri.file(out.trim()));
				}
				catch (e) {
					vscode.window.showErrorMessage(e);
				}
			});
		}
	});

	const submitCommand = vscode.commands.registerCommand('extension.exercism.submit', async () => {
		const exercismApp = await env.run(getExercismAppPath);
		if (exercismApp && await env.run(ensureToken, exercismApp)) {
			const currentWorkspace = (vscode.workspace.workspaceFolders || [])
				.filter(w => env.run(workspaceHasExercismMetadata, w.uri.fsPath));

			if (currentWorkspace.length >= 1 && vscode.window.activeTextEditor) {
				const currentFile = vscode.window.activeTextEditor.document.uri.fsPath;

				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: `Submiting exercise ${vscode.window.activeTextEditor.document.fileName}`
				}, async (progress) => {
					await sleep(1000);
					try {
						const [res, _] = await executeProgramR(`${exercismApp} submit ${currentFile}`);
						vscode.window.showInformationMessage('Exercise submited: ' + res);
					}
					catch (e) {
						vscode.window.showErrorMessage(e);
					}
				});
			}
			else {
				vscode.window.showInformationMessage('Current workspace is not a valid exercism folder.');
			}
		}
	});

	const openCommand = vscode.commands.registerCommand('extension.exercism.open', async () => {
		const exercismApp = await env.run(getExercismAppPath);
		if (exercismApp && await env.run(ensureToken, exercismApp)) {
			const currentWorkspace = (vscode.workspace.workspaceFolders || [])
				.filter(w => env.run(workspaceHasExercismMetadata, w.uri.fsPath));

			if (currentWorkspace.length >= 1) {
				await executeProgram(`${exercismApp} open ${currentWorkspace[0].uri.fsPath}`);
			}
			else {
				vscode.window.showInformationMessage('Current workspace is not a valid exercism folder.');
			}
		}
	});

	context.subscriptions.push(fetchCommand);
	context.subscriptions.push(submitCommand);
	context.subscriptions.push(openCommand);
}

export function deactivate() {}
