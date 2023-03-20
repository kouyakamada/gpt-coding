/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as dotenv from "dotenv";
import { arrayBuffer } from 'stream/consumers';
import axios, { isCancel, AxiosError } from 'axios';
import { resolve } from 'path';
import * as child_process from 'child_process';
import { start } from 'repl';

dotenv.config();

var url = require('url');
var https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
const config = vscode.workspace.getConfiguration('gpt-coding');
var api_key = config.get<String>("OPENAI-APIKEY");
var proxy = config.get<String>("HTTP-PROXY");

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "gpt-coding" is now active!');
	let disposable = vscode.commands.registerCommand('gpt-coding.startcoding', () => {
		vscode.window.showInformationMessage('gpt-coding is processing!');
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			//vscode.window.showInformationMessage(String(api_key));
			//console.log(proxy);
			const document = editor.document;
			const language = String(document.languageId);
			const text = String(document.getText());
			const orders = extract_order(text);
			console.log(orders);
			if (orders) {
				orders.forEach(async (value) => {
					console.log(value);
					const prompt = String(make_prompt(language, value));
					console.log(prompt);
					var position = findTargetPosition(text, value);
					var start_pos = new vscode.Position(position.startLine, position.startChar);
					var end_pos = new vscode.Position(position.endLine, position.endChar);
					call_gpt(prompt)
						.then(resolve => {
							console.log("code:");
							console.log(resolve);
							let editpostion = text.indexOf("\n");
							console.log(editpostion);
							console.log(start_pos);
							console.log(editor);
							editor.edit(editBuilder => {
								editBuilder.replace(new vscode.Range(start_pos, end_pos), String("\n" + resolve + "\n"));
							});
						}).catch(error => {
							console.error(error);
						});;

				});
			} else {
				vscode.window.showInformationMessage('Not Found Order!');
			}
		} else {
			vscode.window.showInformationMessage("editor not active.");
		}
	});

	context.subscriptions.push(disposable);
}

function extract_order(text: string) {
	var orders = text.match(/gpt-coding{[\s\S]*}/g);
	return orders;
}

function make_prompt(language: string, order: string) {
	if (order) {
		//let language = String(order.match(/\[.*\]/)).replace(/\[/, "").replace(/\]/, "");
		let prompt
			= String(language)
			+ "で以下の仕様のコードを記述してください。またどのような挙動をしているか分かりやすいように細かくコメントを書いてください。\n仕様:"
			+ String(order.match(/{[\s\S]*}/)).replace(/{/, "").replace(/}/, "");
		return prompt;
	}

}

function findTargetPosition(document: string, target: string) {
	const startIndex = document.indexOf(target);
	const endIndex = startIndex + target.length - 1;
	const startLine = document.substr(0, startIndex).split('\n').length;
	const endLine = document.substr(0, endIndex).split('\n').length;
	const startChar = startIndex - document.lastIndexOf('\n', startIndex - 1);
	const endChar = endIndex - document.lastIndexOf('\n', endIndex - 1);
	console.log(startLine, startChar, endLine, endChar);
	return {
		startLine: startLine,
		startChar: startChar,
		endLine: endLine,
		endChar: endChar
	};
}

async function call_gpt(prompt: string) {
	// HTTPS endpoint for the proxy to connect to
	var endpoint = process.argv[2] || 'https://api.openai.com/v1/chat/completions';
	var options = url.parse(endpoint);

	// create an instance of the `HttpsProxyAgent` class with the proxy server information
	try {
		var agent = new HttpsProxyAgent(proxy);
		options.agent = agent;
		return new Promise((resolve, error) => {
			axios({
				method: 'post',
				url: 'https://api.openai.com/v1/chat/completions',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + api_key
				},
				data: {
					model: "gpt-3.5-turbo",
					messages: [{ "role": "user", "content": prompt }],
					temperature: 0.7
				},
				proxy: false,
				httpsAgent: agent
			}).then(function (response) {
				//console.log(String(response.data.choices[0].message.content).trim());
				let code = response.data.choices[0].message.content.trim();
				//console.log(code);
				return resolve(code);
			}).catch(function (response) {
				vscode.window.showInformationMessage('Try using a proxy...');
			});
		});
	} catch {
		vscode.window.showInformationMessage('Try using a proxy...');
		try {
			return new Promise((resolve, error) => {
				axios({
					method: 'post',
					url: 'https://api.openai.com/v1/chat/completions',
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + api_key
					},
					data: {
						model: "gpt-3.5-turbo",
						messages: [{ "role": "user", "content": prompt }],
						temperature: 0.7
					},
				}).then(function (response) {
					//console.log(String(response.data.choices[0].message.content).trim());
					let code = response.data.choices[0].message.content.trim();
					//console.log(code);
					return resolve(code);
				}).catch(function (response) {
					return error(response);
				});
			});
		} catch {
			vscode.window.showInformationMessage('API call ERROR!');
		}

	}
}



export function deactivate() { }
