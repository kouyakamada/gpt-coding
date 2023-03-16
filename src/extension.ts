/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import { arrayBuffer } from 'stream/consumers';

dotenv.config();
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "gpt-coding" is now active!');
	let disposable = vscode.commands.registerCommand('gpt-coding.startcoding', () => {
		vscode.window.showInformationMessage('Hello World from gpt-coding!');
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const text = String(document.getText());
			const orders = extract_order(text);
			console.log(orders);
			if (orders) {
				orders.forEach(async (value) => {
					console.log(value);
					let prompt = String(make_prompt(value));
					console.log(prompt);
					let code = String(await call_gpt(prompt));
					console.log(code);
					//editor.edit(editBuilder => {
					//	editBuilder.replace(new vscode.Position(text.indexOf(order), order.length), code);
					//});
				});
			} else {
				console.log("not order");
				vscode.window.showInformationMessage('code not formatted.');
			}
		} else {
			vscode.window.showInformationMessage("editor not active.");
		}
	});

	context.subscriptions.push(disposable);
}

function extract_order(text: string) {
	var orders = text.match(/gpt-coding\[.*\]{.*}/g);
	return orders;
}

function make_prompt(order: string) {
	if (order) {
		let language = String(order.match(/\[.*\]/)).replace(/\[/, "").replace(/\]/, "");
		let prompt
			= String(language)
			+ "で以下の仕様のコードを記述してください。\n仕様:"
			+ String(order.match(/{.*}/)).replace(/{/, "").replace(/}/, "");
		return prompt;
	}

}

async function call_gpt(prompt: string) {
	const completion = await openai.createCompletion({
		model: "gpt-3.5-turbo-0301",
		prompt: prompt,
	});
	return completion.data.choices[0].text;

}


export function deactivate() { }
