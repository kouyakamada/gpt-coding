/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as dotenv from "dotenv";
import { arrayBuffer } from 'stream/consumers';
import axios, { isCancel, AxiosError } from 'axios';
import { resolve } from 'path';
import * as child_process from 'child_process';

dotenv.config();

var url = require('url');
var https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
var proxy = process.env["HTTP_PROXY"];
var api_key = process.env["openai-apikey"];

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "gpt-coding" is now active!');
	let disposable = vscode.commands.registerCommand('gpt-coding.startcoding', () => {
		vscode.window.showInformationMessage('Hello World from gpt-coding!');
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			console.log(api_key);
			const document = editor.document;
			const text = String(document.getText());
			console.log(text.indexOf("\n"));
			const orders = extract_order(text);
			console.log(orders);
			if (orders) {
				orders.forEach(async (value) => {
					console.log(value);
					let prompt = String(make_prompt(value));
					console.log(prompt);
					call_gpt(prompt)
						.then(resolve => {
							console.log("code:");
							console.log(resolve);
							let editpostion = text.indexOf("\n");
							console.log(editpostion);
							editor.edit(editBuilder => {
								//editBuilder.delete()
								editBuilder.replace(new vscode.Position(text.indexOf(value), 0), String("{" + resolve + "}"));
							});
						}).catch(error => {
							console.error(error);
						});;

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
	var orders = text.match(/gpt-coding\[.*\](.*)/g);
	return orders;
}

function make_prompt(order: string) {
	if (order) {
		let language = String(order.match(/\[.*\]/)).replace(/\[/, "").replace(/\]/, "");
		let prompt
			= String(language)
			+ "で以下の仕様のコードを記述してください。ただしコードとコメント以外の要素は不要です。\n仕様:"
			+ String(order.match(/{.*}/)).replace(/{/, "").replace(/}/, "");
		return prompt;
	}

}

function get_position(document: string, target: string) {
	let target_index = document.indexOf(target);
	let target_start = [0, 0];
	let target_end = [0, 0];
	let index = document.indexOf("\n");
	while (index !== -1 || index >= target_index) {
		target_start[0] += 1;
		index = document.indexOf("\n", index + 1);
	}
	while (document.charAt(index) !== "") {
		target_start[1] = index - target_index;
	}
	index = target.indexOf("\n");
	while (index !== -1) {
		target_end[0] += 1;
		index = target.indexOf("\n", index + 1);
	}

}

async function call_gpt(prompt: string) {
	// HTTPS endpoint for the proxy to connect to
	var endpoint = process.argv[2] || 'https://api.openai.com/v1/chat/completions';
	var options = url.parse(endpoint);

	// create an instance of the `HttpsProxyAgent` class with the proxy server information
	try{
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
					model: "gpt-3.5-turbo-0301",
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
				console.log(response);
				return error("api error!");
			});
		});
	}catch{
		return new Promise((resolve, error) => {
			axios({
				method: 'post',
				url: 'https://api.openai.com/v1/chat/completions',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + api_key
				},
				data: {
					model: "gpt-3.5-turbo-0301",
					messages: [{ "role": "user", "content": prompt }],
					temperature: 0.7
				},
			}).then(function (response) {
				//console.log(String(response.data.choices[0].message.content).trim());
				let code = response.data.choices[0].message.content.trim();
				//console.log(code);
				return resolve(code);
			}).catch(function (response) {
				console.log(response);
				return error(response);
			});
		});
	}
}	



export function deactivate() {}
