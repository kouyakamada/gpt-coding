import os

import openai

# APIキーの設定
openai.api_key = "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"
os.environ['http_proxy'] = 'http://koya.kamada:kouya0301@gproxy.toppan.co.jp:8088'
os.environ['https_proxy'] = 'http://koya.kamada:kouya0301@gproxy.toppan.co.jp:8088'

response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "大谷翔平について教えて"},
    ],
)
print(response.choices[0]["message"]["content"].strip())
