/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import { arrayBuffer } from 'stream/consumers';
import axios, { isCancel, AxiosError } from 'axios';

dotenv.config();
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const instance = axios.create({
	baseURL: "https://api.openai.com/v1",
	headers: {
		"Content-Type": "application/json",
		"Authorization": "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"
	},
	timeout: 2000,
});


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "gpt-coding" is now active!');
	let disposable = vscode.commands.registerCommand('gpt-coding.startcoding', () => {
		vscode.window.showInformationMessage('Hello World from gpt-coding!');
		const editor = vscode.window.activeTextEditor;
		call_gpt("test");
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
	instance.post("/chat/completions",
		{
			model: "gpt-3.5-turbo-0301",
			messages: [{ "role": "user", "content": "Say this is a test!" }],
			temperature: 0.7
		});

	axios({
		method: 'post',
		url: 'https://api.openai.com/v1/chat/completions',
		proxy: {
			protocol: 'http',
			host: 'http://gproxy.toppan.co.jp',
			// hostname: '127.0.0.1' // Takes precedence over 'host' if both are defined
			port: 8088,
			auth: {
				username: 'koya.kamada',
				password: 'kouya0301'
			}
		},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "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"
		},
		data: {
			model: "gpt-3.5-turbo-0301",
			messages: [{ "role": "user", "content": "Say this is a test!" }],
			temperature: 0.7
		}
	}).then(function (response) {
		console.log(response.data);
	});
	//const openai = new OpenAIApi(configuration);
	//const completion = await openai.createCompletion({
	//	model: "gpt-3.5-turbo-0301",
	//	prompt: prompt,
	//});
}


export function deactivate() { }
