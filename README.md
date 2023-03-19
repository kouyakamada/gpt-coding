# GPT-coding README

## 使い方

**0.プロキシ環境下で使う場合は環境変数に設定**  
  
``` 
SET HTTP_PROXY=http://proxy_addr:port or http://username:password@proxy_addr:port
SET HTTPS_PROXY=http://proxy_addr:port or http://username:password@proxy_addr:port
```  

**1.環境変数[openai-apikey]に自分のapikeyを設定**  
  
[OPENAI-API](https://openai.com/blog/openai-api)にアクセスし、アカウント作成  
API-KEYを取得し環境変数に設定
```
SET openai-apikey=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

**2.コーディング**  
   
```
gpt-coding{要件}
```
 のフォーマットで入力後 "gpt coding start"コマンドを実行 または ctrl+F1

gpt3が生成したコードが自動で入力されます

生成されるコードの言語はファイルの拡張子に依存します