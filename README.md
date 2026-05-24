# FindFromProblem（MVP）

課題起点でニッチな個人開発アプリを発見する Next.js / Prisma / pgvector / OpenAI 構成の最小実装です。

**リポジトリの実体**は `Documents/app_20260523/app_20260523/`（内側のフォルダ）にあります。外側に空のラッパーディレクトリがある場合は、この内側をエディタで開いてください。

## セットアップ

1. Node.js 20+ を用意し、プロジェクト直下で依存関係をインストール済みなら `npm install`。
2. `.env.example` を参考に `.env` を作成（`DATABASE_URL` / `OPENAI_API_KEY` / `DEVELOPER_JWT_SECRET` / `DEVELOPER_PASSWORD` など）。
3. Postgres で `pgvector` 拡張を有効化できる接続文字列を `DATABASE_URL` に設定。
4. スキーマ反映:

   ```bash
   npx prisma migrate deploy
   ```

   ローカル開発では `npx prisma migrate dev` でも可。

5. 開発サーバ:

   ```bash
   npm run dev
   ```

## 主要フロー

- `/` : 課題入力 → `POST /api/search` で embedding 類似検索 + LLM による推薦理由・注意点。
- 通常モードでは `search_logs` と（条件付きで）`unmet_needs` に保存。シークレットモードでは **一切 DB 保存しない**。
- `/developer/login` : 開発者パスワードで JWT（HttpOnly クッキー）を発行。
- `/developer/apps/new` : アプリ登録（タグ未入力時は AI 推論）。`search_text` を生成し embedding を保存。
- `/developer/needs` / `/developer/needs/[id]` : 未解決ニーズの一覧・詳細（メモ保存に PATCH API）。

## API

| Method | Path | 認証 |
| --- | --- | --- |
| POST | `/api/search` | 不要 |
| GET / POST | `/api/apps` | GET 公開 / POST 開発者 |
| GET | `/api/apps/[id]` | 不要 |
| GET | `/api/developer/needs` | 開発者 |
| GET / PATCH | `/api/developer/needs/[id]` | 開発者 |
| POST | `/api/developer/auth/login` | 不要 |
| POST | `/api/developer/auth/logout` | 不要（クッキー削除） |

## Vercel デプロイ

1. プロジェクトを Git 連携し、Postgres（Supabase / Neon / Vercel Postgres 等）を用意して `pgvector` を有効化。
2. 環境変数に `.env.example` の各キーを設定。
3. Build Command は `npm run build`（`postinstall` で `prisma generate` 済み）。
4. 初回デプロイ後に `npx prisma migrate deploy` を CI か手動で実行。

## テスト

```bash
npm test
```

純粋関数（未解決ニーズ判定の OR ロジックなど）を中心に Vitest でカバーしています。DB や OpenAI を必要とする結合テストは含めていません。

## 仕様メモ

- `unmet_needs.embedding` はクラスタ統合用に追加（代表文の embedding）。ビジネスロジック上の「類似検索でマージ」に利用。
- シークレットモードでは `console.log(query)` を行わず、エラーレスポンスにもクエリ本文を含めません。
