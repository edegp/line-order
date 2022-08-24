# LINE Mobile Order Application

# What

`LIFF`を使用した、**LINE アカウント**だけでモバイルオーダー可能なアプリ

## feature

**frontend**

- _Next.js_ &emsp;SPA 作成の React フレームワーク
- _React_ UI &emsp;特化の javascript ライブラリ
- _Typescript_&emsp; 静的型付けに特化した javascript
- _Tailwind_ &emsp;クラスからスタイリングできる CSS
- _Mantine UI_ &emsp;Chakra UI の進化系 UI ライブラリ
- _LIFF_ LINE &emsp;フロントエンドフレームワーク
- _LINE Pay_ &emsp;LINE の決済サービス
- _Redux-Toolkit_ &emsp;Redux の簡易型　状態管理
- _Sass_
- _Eslint_

**backend**

- _Node.js_
- _Typescript_
- _Firebase Firestore_
- _Firebase CloudFunction_

# How

## 1. Clone this repository

```sh
git clone https://github.com/edegp/line-order.git
```

## 2. Create firebase project

![](/docs/2022-08-24-11-09-31.png)

## 3. Add Application in firebase project

![](/docs/2022-08-24-11-10-51.png)

## 4. Create firebasestore db

### choose your region (if your location is tokyo, choose asia-northeast1)

![](/docs/2022-08-24-11-15-07.png)

## 5. Init Firebase

### frontend

```typescript : front/fb/firebase-client..ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: `${process.env.PROJECT_ID}.firebaseapp.com`,
  databaseURL: `DATABASE_NAME{process.env.REGION}.firebaseio.com`,
  projectId: process.env.PROJECT_ID,
  storageBucket: `${process.env.PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.MESSAGEING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.G_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
```

add envirement variables in .env file

```dotenv : front/.env.local
FIREBASE_API=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
MESSAGEING_SENDER_ID=
APP_ID=
G_MEASUREMENT_ID=
REGION=
NEXT_PUBLIC_LIFF_ID=
```

### backend

```sh
# install firebase CLI
npm install -g firebase-tools
# ログイン
firebase login
```

![](/docs/2022-08-24-11-24-21.png)

プロジェクト確認

```sh
firebase projects:list
┌──────────────────────┬─────────────────┬────────────────┬──────────────────────┐
│ Project Display Name │ Project ID      │ Project Number │ Resource Location ID │
├──────────────────────┼─────────────────┼────────────────┼──────────────────────┤
│ LineMobileOrder      │ linemobileorder │  ------------  │ asia-northeast1      │
└──────────────────────┴─────────────────┴────────────────┴──────────────────────┘
```

```sh
# 初期化
cd ../functions
firebase init
```

choose **firestore** and **emulator**

## 5. Install package

### frontend

```sh
cd front

npm i
# or
yarn i
```

### backend

```sh
cd functions

npm i
# or
yarn i
```

## 6. Enjoy your development

in front directory

```sh
# dev server
npm run dev
# or
yarn dev
# and function
cd ../functions
npm run server
```

open with browser http://localhost:3000
