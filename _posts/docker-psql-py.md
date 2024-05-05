---
title: 'Python×Next.js×PostgreSQLの環境をDockerで構築する'
excerpt: 'langchainを使った個人開発をするためにPython×Next.js×PostgreSQLの環境をDockerで構築したので、備忘録として残しておきます。'
coverImage: '/assets/default.webp'
date: '2024-01-01'
ogImage:
  url: '/assets/default.webp'
tags:
  - 'Docker'
  - 'Python'
  - 'Next.js'
  - 'PostgreSQL'
---

# はじめに

langchain を使った個人開発をするために Python×Next.js×PostgreSQL の環境を Docker で構築したので、備忘録として残しておきます。

各環境を Dockerfile で定義して、docker-compose で管理するようにしています。

# 完成イメージ

## ディレクトリ構成

```bash
.
├── front
├── services
│   ├── ai
│   │   ├── api
│   │   └── db
└── docker-compose.yml

```

front, ai_service(api), ai_db の 3 つのコンテナを作成し、これらを docker-compose で管理しています。

# 手順

## docker-compose.yml の作成

まず最初に docker-compose.yml を作成してしまいます。

```yml
version: '3.8'

services:
  front:
    build:
      context: ./front
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    depends_on:
      - ai_service
    volumes:
      - ./front:/app

  ai_service:
    build:
      context: ./services/ai/api
    ports:
      - '5000:5000'
    depends_on:
      - ai_db

  ai_db:
    image: postgres:15
    volumes:
      - ./services/ai/db/init:/docker-entrypoint-initdb.d
      - ./services/ai/db/data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: passw0rd
    ports:
      - '5432:5432'
```

db -> api -> front の順番でコンテナを起動するようにしています。

## db

まず最初に db を作成します。db では Dockerfile を使わず、docker-compose.yml で定義しています。

この部分です。

```yml
  ai_db:
	image: postgres:15
	volumes:
	  - ./services/ai/db/init:/docker-entrypoint-initdb.d
	  - ./services/ai/db/data:/var/lib/postgresql/data
	environment:
	  POSTGRES_DB: postgres
	  POSTGRES_USER: postgres
	  POSTGRES_PASSWORD: passw0rd
	ports:
	  - "5432:5432"
```

### init

コンテナを起動すると、`/docker-entrypoint-initdb.d`にある SQL ファイルが実行されます。今回は、`init`ディレクトリに`init.sql`を作成し、テーブルを作成する SQL を記述しています。

```sql
DROP TABLE IF EXISTS messages;

CREATE TABLE IF NOT EXISTS messages(
    id serial PRIMARY KEY,
    title text NOT NULL,
    body text NOT NULL
);

INSERT INTO messages (title, body) VALUES ('Initial Message', 'hello from python');
```

これで、コンテナを起動すると、以下のようなテーブルが作成されます。

```bash
$ docker compose exec ai_db psql -U postgres -d postgres -c "\dt"
		List of relations
 Schema |  Name   | Type  | Owner
--------+---------+-------+--------
 public | messages | table | postgres
(1 row)
```

```bash
$ docker compose exec ai_db psql -U postgres -d postgres -c "select * from messages"
 id |      title       |       body
----+------------------+-------------------
  1 | Initial Message  | hello from python
(1 row)
```

### データの永続化

開発中にコンテナを再起動すると、データが消えてしまうので、データの永続化を行っています。

```yml
  ai_db:
	image: postgres:15
	volumes:
	  - ./services/ai/db/init:/docker-entrypoint-initdb.d
	  - ./services/ai/db/data:/var/lib/postgresql/data   <<< ここ
```

/services/ai/db/data:/var/lib/postgresql/data にデータが保存されます。

## api

次に api を作成します。ディレクトリ構成は以下のようになります。

```bash
.
├── Dockerfile
├── app.py
├── health
│   ├── __init__.py
│   └── health.py
└── requirements.txt
```

health.py は api の動作確認用に作成したエンドポイントで、app.py から呼び出されます。

まず以下のように Dockerfile を作成します。

```Dockerfile
FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]
```

### requirements.txt

api で使用するライブラリを記述します。

```txt
Flask
flask-cors
psycopg2-binary
```

- Flask: Web フレームワーク
- flask-cors: CORS 対応
- psycopg2-binary: PostgreSQL を使うためのライブラリ

### app.py

api のエントリーポイントは app.py です。

```python
from flask import Flask
from flask_cors import CORS
from health.health import health_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(health_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
```

### health

api の動作確認用に health エンドポイントを作成します。動作確認用に`health`を呼び出します。

また、front から api にアクセスするために、CORS 対応をしています。

```python
from flask import Blueprint, jsonify
import psycopg2
import os

# 環境変数からデータベース接続情報を取得（適宜変更してください）
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:passw0rd@ai_db:5432/postgres')
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@health_bp.route('/greeting', methods=['GET'])
def greeting():
    conn = None
    try:
        cur.execute('SELECT body FROM messages ORDER BY id LIMIT 1')
        body = cur.fetchone()
        if body:
            return jsonify({"message": body[0]}), 200
        else:
            return jsonify({"message": "No message found"}), 404
    except (Exception, psycopg2.DatabaseError) as error:
        return jsonify({"error": str(error)}), 500
    finally:
        if conn is not None:
            conn.close()
```

先ほど作成した db コンテナとコネクションを張り、`messages`テーブルからデータを取得しています。

## front

最後に front を作成します。ディレクトリ構成は以下のようになります。

仮の Dockerfile を作成しておきます。

```yml
FROM node:21-alpine

WORKDIR /app/
```

このコンテナに入って、`npx create-next-app`を実行します。コンテナに入ったら Dockerfile を一旦削除する必要があります。

```bash
$ docker compose run --rm front sh
/app # rm Dockerfile
/app # npx create-next-app .
```

コンテナを抜けて、Dockerfile を再度作成します。

```yml
FROM node:21-alpine

WORKDIR /app/

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

また、page.tsx を以下のように編集します。

```tsx
export default async function Home() {
  const data = await fetch('http://ai_service:5000/api/greeting', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const greeting = await data.json();

  return (
    <div>
      <h1>{greeting.message}</h1>
      <p>nextjsで描画しています</p>
    </div>
  );
}
```

`fetch`の URL を`http://ai_service:5000/api/greeting`にしています。`ai_service`は docker-compose.yml で定義したコンテナ名です。

# 起動

```bash
$ docker compose up -d
```

`localhost:3000`にアクセスして、`hello from python`が表示されれば OK です。

終了するときは以下のコマンドを実行します。

```bash
docker compose down
```

また、再ビルドするときは以下のコマンドを実行します。

```bash
docker compose up -d --build
```

# おわりに

今回は、Python×Next.js×PostgreSQL の環境を Docker で構築しました。
