# GPT-coding README

## 使い方

**0.インストール**
vscodeの拡張機能のメニューのvsixからのインストールでgpt-coding-x.x.x.vsixを指定

**1.初期設定**  
  
[OPENAI-API](https://openai.com/blog/openai-api)にアクセスし、アカウント作成  

API-KEYを取得し設定

プロキシ環境下で使用する場合はプロキシアドレスの設定

**2.コーディング**  
   
```
gpt-coding{要件}
```
 のフォーマットで入力後 "gpt coding start"コマンドを実行 または ctrl+F1

gpt3が生成したコードが自動で入力されます

生成されるコードの言語はファイルの拡張子に依存します