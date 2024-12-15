## フロントエンドのリポジトリはこちら
<p>https://github.com/tomo324/idea-app-front</p>

## このサービスについて
<p>アイデアを投稿して共有するサービスです。AI融合機能によって、投稿された複数のアイデアを融合して新しいアイデアを生み出すことができます。</p>

## 作った理由
<p>「多くの人に価値を届けるサービスを作りたい。しかし、どのようなサービスがより多くの人々のニーズに答えられるのか分からない。」このような状況で試行錯誤した個人的な経験から、アイデアを発見するこのサービスを開発しました。


現在、新規事業やアプリ開発のアイデアは様々な場所に散乱しています。人々が生活の中で感じた「こんなものがあったらいいのに」という声は、様々なプラットフォームの大量のコンテンツの中に埋もれてしまっています。このサービスの目的は、人々が生活の中で得た「気づき」が埋もれてしまうことなく、有効活用されるような場所を提供することにあります。一人でも多くのユーザーに「ここに気づきを書けば誰かが解決してくれそうだ」と思ってもらい、多くのアイデアが集まる場になることを目指しています。


世の中に浸透し私たちの生活の一部になっているサービスも、最初は些細な気づきから生まれました。「ここが不便だ」「こんなサービスがあったらいいのに」という日常の些細な気づきは、多くの可能性をはらんでいます。


アイデアは人々の経験から生まれます。生成AIを利用しても、画期的なアイデアをゼロから生み出すことは難しいです。このサービスでは、人々の経験に基づいたアイデアを元にAI融合を行うことで、画期的なアイデアを生み出すことが可能になっています。


多様なアイデアの蓄積と、AIによる融合の組み合わせによって、このサービスが生み出せる価値は無限大に広がっていくと考えています。</p>

## 技術構成
フロントエンド: TypeScript(ver 5.3.3) / React(ver 18.2.0) / Next.js(App router) (ver 14.1.0)

バックエンド: TypeScript(ver 5.3.3) / NestJS(ver 10.2.1)

ORM: Prisma(ver 5.7.1)

CSSフレームワーク: Tailwind CSS

DB: PostgreSQL

開発ツール: Docker / Storybook

テスト: Jest / pactumjs / React Testing Library

デプロイ: Vercel(フロント) / Heroku(バックエンド)

外部サービス: DeepL API / ChatGPT API

デザイン: Figma

## 工夫したポイント

### サービスの面白さがユーザー数に依存し過ぎないようにした
SNSのようなサービスを個人開発する際、ネックとなるのがユーザー数の確保です。多くのユーザーがいないと機能を十分に利用できないサービスの場合、ユーザー数が少ないリリースの初期段階では使える機能が制限され、「つまらない」と感じてしまいます。
<br>
このサービスではAI融合機能にランダム性を持たせ、ユーザー数や投稿数が少なくても様々な融合パターンを楽しめるようにしました。もちろん、ユーザー数が多ければ多いほど多様なアイデアを扱うことができるようになり、サービスはより面白くなります！

### UI, UXへのこだわり
快適に操作できるかがユーザーの定着率を左右すると考え、UI, UXには特にこだわりました。一部、人気サービスのUIを参考にすることにより、多くの人が直感的に操作できるようにしました。
<br>
また、Next.jsのIntercepting Routesを取り入れることにより高い操作感でモーダル等を扱えるようにしました。

### テストを開発に積極的に取り入れた
機能の拡張やリファクタリングの際にコードの品質を維持しやすくするため、開発の中でE2Eテストやユニットテストを積極的に取り入れました。また、テスト駆動開発のサイクルを回しながら開発を行うことで、効率よく実装できるようになりました。

## ER図

```mermaid

---
title: "ER diagram"
---
erDiagram
    users ||--|{ posts : ""
    posts ||--|{ posts_to_aiposts: ""
    posts_to_aiposts }|--|| aiposts: ""

    users {
      Int id PK "ID"
      String email "Eメール"
      String name "ユーザー名"
      String hash "パスワード"
      DateTime created_at "作成日時"
      DateTime updated_at "更新日時"
    }

    posts {
      Int id PK "ID"
      String content "投稿内容"
      DateTime created_at "作成日時"
      DateTime updated_at "更新日時"
      Int author_id FK "投稿者ID"
    }

    aiposts {
      Int id PK "ID"
      String content "投稿内容"
      DateTime created_at "作成日時"
      DateTime updated_at "更新日時"
    }

    posts_to_aiposts {
      Int id PK "ID"
      Int post_id FK "postのID"
      Int aipost_id FK "aipostのID"
    }
```

## シーケンス図

### auth

```mermaid

---
title: "Signup"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/auth/signup" with email, name, pass
    next->>nest: POST "/auth/signup" with email, name, pass
    nest->>db: save user
    nest->>nest: generate accessToken
    nest->>next: return accessToken in Http header "Set-Cookie" with httpOnly, secure, samesite=None
    next->>next: store accessToken in Cookie
    next->>client: return Response "201", redirect to "/home"
```

```mermaid

---
title: "Signin"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/auth/signin" with email, pass
    next->>nest: POST "/auth/signin" with email, pass
    nest->>db: find user by email
    db->>nest: return user
    nest->>nest: verify password
    nest->>nest: generate accessToken
    nest->>next: return accessToken in Http header "Set-Cookie" with httpOnly, secure, samesite=None
    next->>next: store accessToken in Cookie
    next->>client: return Response "200", redirect to "/home"
```

### home

```mermaid

---
title: "Home"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/home"
    next->>nest: GET "/posts" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: fetch posts
    db->>nest: return posts
    nest->>next: return posts
    next->>nest: GET "/ai-posts" with Cookie
    nest->>db: fetch ai-posts
    db->>nest: return ai-posts
    nest->>next: return ai-posts
    next->>client: display posts and ai-posts

```

### posts

```mermaid

---
title: "Create post"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/posts/create" with content
    next->>nest: POST "/posts/create" with content and Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: save post
    nest->>next: return Response "201"
    next->>client: return Response "201"

```

```mermaid

---
title: "Delete post"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: click delete button
    next->>nest: DELETE "/posts/:id" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>nest: check if this post is owned by user
    nest->>db: delete post
    nest->>next: return Response "200"
    next->>client: return Response "200", redirect to "/posts"
```

```mermaid

---
title: "Get one post"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/posts/:id"
    next->>nest: GET "/posts/:id" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: fetch post by id
    db->>nest: return post
    nest->>next: return post
    next->>next: check if this post is owned by user
    next->>client: display post

```

```mermaid

---
title: "Get posts"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/posts"
    next->>nest: GET "/posts" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: fetch posts
    db->>nest: return posts
    nest->>next: return posts
    next->>client: display posts
```

```mermaid

---
title: "Get my posts"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/posts/my-posts"
    next->>nest: GET "/posts/my-posts" with Cookie
    nest->>nest: Get accessToken from Cookie and verify it
    nest->>db: find posts by userId
    db->>nest: return posts
    nest->>next: return posts
    next->>client: display posts

```

### ai-posts

```mermaid

---
title: "Create AI post"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant gpt as ChatGPT server
    participant db as Database
    client->>next: "/ai-posts/create"
    next->>nest: GET "/ai-posts/generate" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: fetch random posts
    db->>nest: return random posts
    nest->>gpt: send postContents
    gpt->>gpt: generate AIContent
    gpt->>nest: return AIContent
    nest->>next: return AIContent
    next->>client: return AIContent
    next->>nest: POST "/ai-posts/create" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: save AIPost
    nest->>next: return Response "201"
    next->>client: return Response "201", redirect to "/ai-posts"
```

```mermaid

---
title: "Get AI posts"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/ai-posts"
    next->>nest: GET "/ai-posts" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: fetch ai-posts
    db->>nest: return ai-posts
    nest->>next: return ai-posts
    next->>client: display ai-posts

```

### user

```mermaid

---
title: "Get my info"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/users"
    next->>nest: GET "/users/me" with Cookie
    nest->>nest: Get accessToken from Cookie and verify it
    nest->>db: find user by accessToken
    db->>nest: return user
    nest->>next: return user
    next->>client: display user

```

```mermaid

---
title: "Delete user"
---

sequenceDiagram
    participant client as client
    participant next as Next.js server
    participant nest as Nestjs server
    participant db as Database
    client->>next: "/users/delete"
    next->>nest: DELETE "/users" with Cookie
    nest->>nest: get accessToken from Cookie and verify it
    nest->>db: delete user by id from accessToken
    nest->>nest: delete accessToken from Cookie
    nest->>next: return Response "200"
    next->>client: return Response "200", redirect to "/"
```
