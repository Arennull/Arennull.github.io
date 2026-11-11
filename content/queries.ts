import type { PreparedQuery } from '../src/lib/types';

export const queries: PreparedQuery[] = [
  {
    id: 'q-built',
    question: {
      en: 'Which RAG projects have you built?',
      es: '¿Qué proyectos RAG has construido?',
      ja: 'どんなRAGプロジェクトを構築しましたか?',
    },
    answer: {
      en: 'Two systems in production. Sangi is a RAG chat over an archive of designer footwear, on Supabase with pgvector and hybrid retrieval merged by rank fusion. JairoFitness is an AI coach that answers in the voice of the real coach, backed by a pgvector knowledge base, reviewed coaching cases and long-term memory of each client.',
      es: 'Dos sistemas en producción. Sangi es un chat RAG sobre un archivo de calzado de diseñador, en Supabase con pgvector y recuperación híbrida fusionada por rango. JairoFitness es un coach de IA que responde con la voz del coach real, apoyado en una base de conocimiento en pgvector, casos de coaching revisados y memoria a largo plazo de cada cliente.',
      ja: '本番稼働のシステムが2つあります。Sangiは、デザイナーシューズのアーカイブに対するRAGチャットで、Supabase上のpgvectorを使い、ハイブリッド検索の結果を逆順位融合(RRF)で統合しています。JairoFitnessは、本物のコーチの声で答えるAIコーチで、pgvectorのナレッジベース、レビュー済みのコーチングの事例、顧客ごとの長期メモリを土台にしています。',
    },
    ungrounded: {
      en: 'Alejandro has extensive experience building cutting-edge RAG solutions for Fortune 500 companies, using LangChain and Pinecone to process millions of documents with 99% accuracy.',
      es: 'Alejandro tiene amplia experiencia construyendo soluciones RAG de vanguardia para empresas del Fortune 500, usando LangChain y Pinecone para procesar millones de documentos con un 99 % de precisión.',
      ja: 'Alejandroは、Fortune 500企業向けに最先端のRAGソリューションを数多く構築してきた豊富な経験があり、LangChainとPineconeを使って、数百万件のドキュメントを99%の精度で処理しています。',
    },
    cites: ['proj-sangi', 'proj-jairo'],
  },
  {
    id: 'q-eval',
    question: {
      en: 'How do you evaluate retrieval quality?',
      es: '¿Cómo evalúas la calidad de la recuperación?',
      ja: '検索の品質をどのように評価していますか?',
    },
    answer: {
      en: 'With a test set built before any tuning: real questions with their expected sources. I measure recall@k (is the right document in the top k?) and MRR (how high is it?), and only then compare chunking, fusion or reranking options. Without that set, every change is a guess.',
      es: 'Con un conjunto de pruebas construido antes de ajustar nada: preguntas reales con sus fuentes esperadas. Mido recall@k (¿está el documento correcto entre los k primeros?) y MRR (¿en qué posición?), y solo entonces comparo opciones de troceado, fusión o rerank. Sin ese conjunto, cada cambio es una apuesta.',
      ja: '調整を始める前に作ったテストセットを使います。期待する出典つきの実際の質問からなるセットです。recall@k(正しいドキュメントが上位k件に入っているか)とMRR(どれだけ上位にあるか)を測り、そのうえでチャンキング、融合、リランクの各方式を比較します。このセットがなければ、変更はどれも当てずっぽうになります。',
    },
    ungrounded: {
      en: 'Retrievers are usually evaluated by checking a few queries manually and seeing whether the results look reasonable. If the answers seem good, the retriever is working well.',
      es: 'Los sistemas de recuperación se suelen evaluar probando unas cuantas consultas a mano y viendo si los resultados parecen razonables. Si las respuestas tienen buena pinta, el sistema funciona bien.',
      ja: '検索システムは、いくつかのクエリを手作業で試し、結果がそれらしく見えるかどうかで評価するのが一般的です。回答が良さそうに見えれば、検索はうまく機能していると言えます。',
    },
    cites: ['eval-metrics', 'eval-why'],
  },
  {
    id: 'q-reranker',
    question: {
      en: 'Why did you reject a reranker?',
      es: '¿Por qué descartaste un reranker?',
      ja: 'なぜリランカーを不採用にしたのですか?',
    },
    answer: {
      en: 'Because the evaluation said so. On Sangi we compared variants on 103 cases: plain rank fusion reached an MRR of 0.73 on the held-out split, while the reranker lowered recall@10 from 0.92 to 0.85 and added about 4.8 seconds. A reranker has to earn its latency, and that one did not.',
      es: 'Porque lo dijo la evaluación. En Sangi comparamos variantes con 103 casos: la fusión por rango alcanzó un MRR de 0,73 en la parte de reserva, mientras que el reranker bajaba el recall@10 de 0,92 a 0,85 y añadía unos 4,8 segundos. Un reranker tiene que ganarse su latencia, y ese no lo hizo.',
      ja: '評価の結果がそうだったからです。Sangiでは103件のケースで各方式を比較しました。単純な逆順位融合(RRF)はホールドアウト分割でMRR 0.73に達した一方、リランカーはrecall@10を0.92から0.85に下げ、約4.8秒を加えました。リランカーはレイテンシに見合う効果を示す必要があり、そのリランカーは示せませんでした。',
    },
    ungrounded: {
      en: 'Rerankers always improve retrieval quality, so there is rarely a reason to reject one. It is considered best practice to add a reranker to every RAG pipeline.',
      es: 'Los rerankers siempre mejoran la calidad de la recuperación, así que rara vez hay motivo para descartar uno. Se considera buena práctica añadir un reranker a todo pipeline RAG.',
      ja: 'リランカーは検索の品質を必ず向上させるため、不採用にする理由はほとんどありません。すべてのRAGパイプラインにリランカーを追加するのがベストプラクティスとされています。',
    },
    cites: ['proj-sangi-eval', 'rag-rerank'],
  },
  {
    id: 'q-hallucination',
    question: {
      en: 'How do you stop a model from making unsupported claims?',
      es: '¿Cómo evitas que un modelo haga afirmaciones sin respaldo?',
      ja: 'モデルが裏付けのない主張をするのを、どう防いでいますか?',
    },
    answer: {
      en: 'First I measure it: on Sangi, an audit found unsupported claims in 26 of 36 real answers. Then I put the checks in code, outside the model: a claim gate and an evidence gate block any statement the retrieved data does not back. And the answer must cite its sources, or say that it does not know.',
      es: 'Primero lo mido: en Sangi, una auditoría encontró afirmaciones sin respaldo en 26 de 36 respuestas reales. Después pongo las comprobaciones en código, fuera del modelo: una puerta de afirmaciones y otra de evidencia bloquean lo que los datos recuperados no respaldan. Y la respuesta debe citar sus fuentes o decir que no lo sabe.',
      ja: 'まず測定します。Sangiでは、監査で実際の回答36件中26件に裏付けのない主張が見つかりました。次に、チェックをモデルの外のコードに置きます。主張ゲートと証拠ゲートが、検索したデータが裏付けない記述をブロックします。そして回答は、出典を示すか、分からないと答えなければなりません。',
    },
    ungrounded: {
      en: 'Hallucinations can be fully eliminated by adding "do not make things up" to the system prompt and lowering the temperature to zero.',
      es: 'Las alucinaciones se pueden eliminar por completo añadiendo «no te inventes nada» al prompt de sistema y bajando la temperatura a cero.',
      ja: 'ハルシネーションは、システムプロンプトに「作り話をしない」と加えて温度をゼロに下げるだけで、完全になくせます。',
    },
    cites: ['proj-sangi-gate', 'brain-guardrails', 'rag-grounding'],
  },
  {
    id: 'q-memory',
    question: {
      en: 'How does an assistant remember each client?',
      es: '¿Cómo recuerda un asistente a cada cliente?',
      ja: 'アシスタントは顧客ごとのことをどうやって長期的に覚えておくのですか?',
    },
    answer: {
      en: 'By extracting durable facts about the user from each conversation, removing duplicates, and bringing back only the relevant ones later. On JairoFitness that memory sits next to the knowledge base and the reviewed coaching cases, so the coach remembers each client.',
      es: 'Extrayendo de cada conversación los hechos duraderos sobre el usuario, eliminando duplicados y recuperando después solo los relevantes. En JairoFitness esa memoria convive con la base de conocimiento y los casos de coaching revisados, de modo que el coach recuerda a cada cliente.',
      ja: '各会話から本人に関する持続的な事実を抽出し、重複を取り除き、あとで関連するものだけを呼び出します。JairoFitnessでは、そのメモリがナレッジベースやレビュー済みのコーチングの事例と並んで置かれているので、コーチは顧客一人ひとりを覚えています。',
    },
    ungrounded: {
      en: 'Modern language models remember every user automatically, because all past conversations are stored inside the model weights after each chat.',
      es: 'Los modelos de lenguaje modernos recuerdan a cada usuario automáticamente, porque todas las conversaciones pasadas quedan guardadas en los pesos del modelo después de cada chat.',
      ja: '最近の言語モデルは、チャットのたびにこれまでのすべての会話がモデルの重みの中に保存されるため、ユーザーを自動的にすべて覚えています。',
    },
    cites: ['brain-memory', 'proj-jairo'],
  },
  {
    id: 'q-embedding',
    question: {
      en: 'What is an embedding and how do you compare two vectors?',
      es: '¿Qué es un embedding y cómo se comparan dos vectores?',
      ja: '埋め込みとは何ですか?また、2つのベクトルをどう比較しますか?',
    },
    answer: {
      en: 'A way to turn text into a list of numbers so that similar meanings end up close together, even with no words in common. Closeness is measured with cosine similarity, the angle between two vectors. It ignores the length of the vector and looks only at its direction: 1 means the same meaning, 0 means unrelated.',
      es: 'Una forma de convertir texto en una lista de números para que los significados parecidos queden cerca, aunque no compartan palabras. La cercanía se mide con la similitud coseno, el ángulo entre dos vectores. Ignora la longitud del vector y mira solo su dirección: 1 es el mismo significado y 0 es que no tienen relación.',
      ja: 'テキストを数値のリストに変換し、意味が近いものが、共通する単語がなくても近くに配置されるようにする手法です。近さはコサイン類似度、つまり2つのベクトルの間の角度で測ります。ベクトルの長さは無視して向きだけを見ます。1は同じ意味、0は無関係を表します。',
    },
    ungrounded: {
      en: 'An embedding is a compressed copy of a document, similar to a zip file, that the model can decompress to read the original text.',
      es: 'Un embedding es una copia comprimida de un documento, parecida a un archivo zip, que el modelo puede descomprimir para leer el texto original.',
      ja: '埋め込みとは、ドキュメントを圧縮したコピーのことで、zipファイルのようなものです。モデルはこれを展開して、元のテキストを読み取れます。',
    },
    cites: ['emb-what', 'emb-cosine'],
  },
  {
    id: 'q-hybrid',
    question: {
      en: 'Why combine keyword search and vector search, and how do you merge them?',
      es: '¿Por qué combinar búsqueda por palabras clave y vectorial, y cómo las fusionas?',
      ja: 'なぜキーワード検索とベクトル検索を組み合わせるのですか?また、どうやって統合しますか?',
    },
    answer: {
      en: 'Because they fail in opposite ways. Vector search understands meaning but misses exact names and codes; keyword search finds those but not paraphrases. I run both and merge them with reciprocal rank fusion, which uses positions instead of scores that are not comparable.',
      es: 'Porque fallan de forma opuesta. La búsqueda vectorial entiende el significado pero falla con nombres y códigos exactos; la de palabras clave los encuentra, pero no las paráfrasis. Lanzo las dos y las fusiono por rango recíproco, que usa posiciones en lugar de puntuaciones que no son comparables.',
      ja: '両者は正反対の弱点を持つからです。ベクトル検索は意味を捉えますが、正確な名前やコードには弱く、キーワード検索はそれらを見つけられますが、言い換えには弱いです。両方を実行し、比べられないスコアの代わりに順位を使う逆順位融合(RRF)で統合します。',
    },
    ungrounded: {
      en: 'Keyword search is obsolete. Vector search is strictly better in every case, so combining them only adds complexity without any benefit.',
      es: 'La búsqueda por palabras clave está obsoleta. La vectorial es estrictamente mejor en todos los casos, así que combinarlas solo añade complejidad sin ningún beneficio.',
      ja: 'キーワード検索はもう時代遅れです。ベクトル検索はあらゆる場面で確実に優れているので、組み合わせても複雑になるだけで、何の利点もありません。',
    },
    cites: ['rag-hybrid', 'rag-rrf'],
  },
  {
    id: 'q-you',
    question: {
      en: 'Who are you and what are you looking for?',
      es: '¿Quién eres y qué buscas?',
      ja: 'あなたの自己紹介と、探しているポジションを教えてください。',
    },
    answer: {
      en: 'I am Alejandro Tiscar, an AI engineer. I build retrieval systems, assistants with memory and the evaluation that keeps them honest, with the team at The AI Business. I am looking for a role where retrieval, knowledge bases and assistants are the product, not a side feature.',
      es: 'Soy Alejandro Tiscar, ingeniero de IA. Construyo sistemas de recuperación, asistentes con memoria y la evaluación que los mantiene honestos, con el equipo de The AI Business. Busco un puesto donde la recuperación, las bases de conocimiento y los asistentes sean el producto y no un añadido.',
      ja: '私はAlejandro Tiscarです。AIエンジニアとして、検索システムや、メモリを持つアシスタント、それらを正直に保つための評価を作っています。The AI Businessのチームと一緒に仕事をしています。検索、ナレッジベース、アシスタントが付随機能ではなくプロダクトそのものであるポジションを探しています。',
    },
    ungrounded: {
      en: 'Alejandro is a senior researcher with a PhD in machine learning and ten years of experience at leading AI labs, currently open to executive positions.',
      es: 'Alejandro es un investigador sénior con un doctorado en aprendizaje automático y diez años de experiencia en laboratorios punteros de IA, actualmente abierto a puestos directivos.',
      ja: 'Alejandroは、機械学習の博士号を持ち、最先端のAIラボで10年の経験を積んだシニアリサーチャーで、現在は経営幹部のポジションにも前向きです。',
    },
    cites: ['about-me', 'about-contact'],
  },
];
