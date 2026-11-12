import type { KnowledgeNode } from '../src/lib/types';

/**
 * Every entry is one tower of the city. `npm run build:brain` embeds them,
 * so editing a text here means regenerating src/data/brain.json.
 */
export const knowledge: KnowledgeNode[] = [
  // ───────────── RAG ─────────────
  {
    id: 'rag-what',
    cluster: 'rag',
    title: { en: 'What RAG is for', es: 'Para qué sirve RAG', ja: 'RAGの使いどころ' },
    text: {
      en: 'Retrieval-augmented generation lets a language model answer from your own documents instead of from memory: first retrieve the relevant fragments, then generate an answer that cites them.',
      es: 'La generación aumentada por recuperación permite que un modelo de lenguaje responda con tus propios documentos y no de memoria: primero se recuperan los fragmentos relevantes y después se genera una respuesta que los cita.',
      ja: '検索拡張生成(RAG)を使うと、言語モデルが記憶ではなく自社のドキュメントをもとに回答できます。まず関連する断片を検索し、次にそれらを出典として示しながら回答を生成します。',
    },
  },
  {
    id: 'rag-hybrid',
    cluster: 'rag',
    title: { en: 'Hybrid retrieval', es: 'Recuperación híbrida', ja: 'ハイブリッド検索' },
    text: {
      en: 'Vector search understands meaning but misses exact names and codes; keyword search does the opposite. Running both and merging the results beats either one alone.',
      es: 'La búsqueda vectorial entiende el significado pero falla con nombres y códigos exactos; la búsqueda por palabras clave hace lo contrario. Lanzar las dos y fusionar los resultados supera a cualquiera por separado.',
      ja: 'ベクトル検索は意味を捉えますが、正確な名前やコードには弱く、キーワード検索はその逆です。両方を実行して結果を統合すると、どちらか一方だけの場合より良い結果になります。',
    },
  },
  {
    id: 'rag-rrf',
    cluster: 'rag',
    title: {
      en: 'Reciprocal rank fusion',
      es: 'Fusión por rango recíproco',
      ja: '逆順位融合(RRF)',
    },
    text: {
      en: 'Reciprocal rank fusion is how I merge keyword search and vector search: it combines the two result lists using only the position of each document, not its score. Scores from a vector index and a lexical index are not comparable, ranks are.',
      es: 'La fusión por rango recíproco es como fusiono la búsqueda por palabras clave y la vectorial: combina las dos listas de resultados usando solo la posición de cada documento, no su puntuación. Las puntuaciones de un índice vectorial y uno léxico no son comparables; las posiciones sí.',
      ja: '逆順位融合(RRF)は、キーワード検索とベクトル検索の結果を統合する方法です。各ドキュメントのスコアではなく順位だけを使って、2つの結果リストを組み合わせます。ベクトルインデックスとキーワード検索のインデックスのスコアは比べられませんが、順位なら比べられます。',
    },
  },
  {
    id: 'rag-chunking',
    cluster: 'rag',
    title: { en: 'Chunking', es: 'Troceado (chunking)', ja: 'チャンキング' },
    text: {
      en: 'Documents are split into chunks before indexing. Chunks that are too small lose context, chunks that are too large dilute the signal, and a little overlap keeps sentences from being cut in half.',
      es: 'Los documentos se dividen en trozos antes de indexarlos. Si son muy pequeños pierden contexto, si son muy grandes diluyen la señal, y un poco de solape evita que una frase quede partida en dos.',
      ja: 'ドキュメントはインデックス化する前にチャンクに分割します。チャンクが小さすぎると文脈が失われ、大きすぎるとシグナルが薄まります。少しオーバーラップさせると、文が途中で切れるのを防げます。',
    },
  },
  {
    id: 'rag-rerank',
    cluster: 'rag',
    title: {
      en: 'Reranking is a trade-off',
      es: 'El rerank es un compromiso',
      ja: 'リランクはトレードオフ',
    },
    text: {
      en: 'A reranker re-scores the retrieved candidates with a slower, more precise model. It often helps, but it costs latency and money, so it has to earn its place in an evaluation before it ships.',
      es: 'Un reranker vuelve a puntuar los candidatos recuperados con un modelo más lento y preciso. Suele ayudar, pero cuesta latencia y dinero, así que tiene que ganarse el sitio en una evaluación antes de salir a producción.',
      ja: 'リランカーは、検索で得た候補を、より遅くて精密なモデルで再採点します。効果が出ることが多い一方で、レイテンシとコストがかかるため、本番に出す前に評価で有効性を示す必要があります。',
    },
  },
  {
    id: 'rag-grounding',
    cluster: 'rag',
    title: { en: 'Grounding and citations', es: 'Fundamentación y citas', ja: '根拠づけと引用' },
    text: {
      en: 'A grounded answer makes no unsupported claims: the model only states what the retrieved sources support, and points to them. If the sources do not contain the answer, the right output is to say so, not to improvise.',
      es: 'Una respuesta fundamentada no hace afirmaciones sin respaldo: el modelo solo afirma lo que respaldan las fuentes recuperadas, y las señala. Si las fuentes no contienen la respuesta, lo correcto es decirlo, no improvisar.',
      ja: '根拠のある回答は、裏付けのない主張をしません。モデルは検索した出典が裏付ける内容だけを述べ、その出典を示します。出典に答えがない場合は、即興で答えず、その旨を伝えるのが正しい出力です。',
    },
  },
  {
    id: 'rag-ingestion',
    cluster: 'rag',
    title: {
      en: 'Incremental ingestion',
      es: 'Ingesta incremental',
      ja: 'インクリメンタルな取り込み',
    },
    text: {
      en: 'An ingestion pipeline should hash each chunk and re-embed only what changed. Queues and scheduled jobs keep the index fresh without paying to embed the whole corpus again.',
      es: 'Un pipeline de ingesta debe calcular el hash de cada trozo y volver a vectorizar solo lo que cambió. Colas y tareas programadas mantienen el índice al día sin pagar por vectorizar todo el corpus otra vez.',
      ja: '取り込みパイプラインでは、各チャンクのハッシュを計算し、変更があった分だけ埋め込みをやり直すべきです。キューと定期ジョブを使えば、コーパス全体を再び埋め込むコストをかけずに、インデックスを最新に保てます。',
    },
  },

  // ───────────── Embeddings ─────────────
  {
    id: 'emb-what',
    cluster: 'embeddings',
    title: { en: 'What an embedding is', es: 'Qué es un embedding', ja: '埋め込みとは' },
    text: {
      en: 'An embedding turns a piece of text into a list of numbers, a vector, so that texts with similar meaning land close together in space even when they share no words.',
      es: 'Un embedding convierte un texto en una lista de números, un vector, de forma que los textos con significado parecido quedan cerca en el espacio aunque no compartan ninguna palabra.',
      ja: '埋め込みは、テキストを数値のリストであるベクトルに変換します。意味が近いテキストは、共通する単語がなくても、空間上で近くに配置されます。',
    },
  },
  {
    id: 'emb-cosine',
    cluster: 'embeddings',
    title: { en: 'Cosine similarity', es: 'Similitud coseno', ja: 'コサイン類似度' },
    text: {
      en: 'To compare two vectors you use cosine similarity, which measures the angle between them: 1 means same direction, 0 means unrelated. It is the usual way to compare embeddings because it ignores vector length.',
      es: 'Para comparar dos vectores se usa la similitud coseno, que mide el ángulo entre ellos: 1 es la misma dirección y 0 es que no tienen relación. Es la forma habitual de comparar embeddings porque ignora la longitud del vector.',
      ja: '2つのベクトルを比較するにはコサイン類似度を使います。ベクトル間の角度を測る指標で、1は同じ向き、0は無関係を意味します。ベクトルの長さを無視するため、埋め込みの比較では標準的な方法です。',
    },
  },
  {
    id: 'emb-ann',
    cluster: 'embeddings',
    title: {
      en: 'Vector indexes (HNSW)',
      es: 'Índices vectoriales (HNSW)',
      ja: 'ベクトルインデックス(HNSW)',
    },
    text: {
      en: 'Comparing a query against every stored vector does not scale. Approximate nearest-neighbour indexes such as HNSW build a navigable graph and find close vectors in milliseconds.',
      es: 'Comparar una consulta con todos los vectores guardados no escala. Los índices de vecinos aproximados como HNSW construyen un grafo navegable y encuentran vectores cercanos en milisegundos.',
      ja: 'クエリを保存されているすべてのベクトルと比較する方法は、スケールしません。HNSWのような近似最近傍インデックスは、辿れるグラフを構築し、近いベクトルをミリ秒で見つけます。',
    },
  },
  {
    id: 'emb-pgvector',
    cluster: 'embeddings',
    title: { en: 'pgvector', es: 'pgvector', ja: 'pgvector' },
    text: {
      en: 'pgvector stores embeddings inside PostgreSQL, next to the rest of the data. Vectors live under the same permissions, transactions and migrations as everything else, with no separate vector database to operate.',
      es: 'pgvector guarda los embeddings dentro de PostgreSQL, junto al resto de los datos. Los vectores viven bajo los mismos permisos, transacciones y migraciones que todo lo demás, sin otra base de datos vectorial que mantener.',
      ja: 'pgvectorは、埋め込みをPostgreSQLの中に、他のデータと並べて保存します。ベクトルも他のデータと同じ権限、トランザクション、マイグレーションの下に置かれ、運用すべき別のベクトルデータベースは不要です。',
    },
  },
  {
    id: 'emb-multilingual',
    cluster: 'embeddings',
    title: { en: 'Multilingual embeddings', es: 'Embeddings multilingües', ja: '多言語の埋め込み' },
    text: {
      en: 'A multilingual embedding model places a sentence and its translation at almost the same point, so a question in Spanish can retrieve a document written in English. This site uses one.',
      es: 'Un modelo de embeddings multilingüe coloca una frase y su traducción casi en el mismo punto, así que una pregunta en español puede recuperar un documento escrito en inglés. Esta web usa uno.',
      ja: '多言語の埋め込みモデルは、文とその翻訳をほぼ同じ位置に配置します。そのため、スペイン語の質問で英語のドキュメントを検索できます。このサイトでも多言語モデルを使っています。',
    },
  },
  {
    id: 'emb-quantization',
    cluster: 'embeddings',
    title: { en: 'Quantization', es: 'Cuantización', ja: '量子化' },
    text: {
      en: 'Quantization stores each vector dimension in one byte instead of four. The ranking barely changes and memory drops by 75%. The vectors behind this city are quantized to 8 bits.',
      es: 'La cuantización guarda cada dimensión del vector en un byte en lugar de cuatro. El ranking apenas cambia y la memoria baja un 75 %. Los vectores de esta ciudad están cuantizados a 8 bits.',
      ja: '量子化では、ベクトルの各次元を4バイトではなく1バイトで保存します。ランキングはほとんど変わらず、メモリは75%減ります。この街のベクトルは8ビットに量子化されています。',
    },
  },
  {
    id: 'emb-model-drift',
    cluster: 'embeddings',
    title: {
      en: 'Never mix embedding models',
      es: 'Nunca mezcles modelos de embeddings',
      ja: '異なる埋め込みモデルを混ぜない',
    },
    text: {
      en: 'Vectors from two different embedding models live in different spaces and cannot be compared. A system should check at startup that the stored vectors and the query model match.',
      es: 'Los vectores de dos modelos de embeddings distintos viven en espacios distintos y no se pueden comparar. Un sistema debe comprobar al arrancar que los vectores guardados y el modelo de consulta coinciden.',
      ja: '2つの異なる埋め込みモデルのベクトルは別々の空間にあり、比較できません。システムは、起動時に保存済みのベクトルとクエリ用のモデルが一致していることを確認すべきです。',
    },
  },
  {
    id: 'emb-projection',
    cluster: 'embeddings',
    title: {
      en: 'Seeing 384 dimensions as a city',
      es: 'Ver 384 dimensiones como una ciudad',
      ja: '384次元を街として見る',
    },
    text: {
      en: 'Each tower here stands for a vector of 384 dimensions. UMAP squeezes them down so they can be drawn as a street plan, keeping neighbours together. The picture is a map; the real distances are computed in the full space.',
      es: 'Cada torre representa aquí un vector de 384 dimensiones. UMAP las comprime para poder dibujarlas como un plano de calles, manteniendo juntos a los vecinos. El dibujo es un mapa; las distancias reales se calculan en el espacio completo.',
      ja: 'ここでは各タワーが384次元のベクトルを表します。UMAPがそれを圧縮し、近いもの同士を近くに保ったまま街の区画として描画できるようにします。描かれた図は地図であり、実際の距離は元の全次元の空間で計算されます。',
    },
  },

  // ───────────── AI brains: memory, agents, guardrails ─────────────
  {
    id: 'brain-what',
    cluster: 'brains',
    title: {
      en: 'What I call an AI brain',
      es: 'A qué llamo un cerebro de IA',
      ja: '私がAIブレインと呼ぶもの',
    },
    text: {
      en: 'An AI brain is the knowledge layer around a model: what it knows about the business, what it remembers about each person, the rules it must follow and the tools it can use.',
      es: 'Un cerebro de IA es la capa de conocimiento que rodea al modelo: lo que sabe del negocio, lo que recuerda de cada persona, las reglas que debe cumplir y las herramientas que puede usar.',
      ja: 'AIブレインとは、モデルを取り巻くナレッジレイヤーです。ビジネスについて知っていること、一人ひとりについて覚えていること、守るべきルール、使えるツールが含まれます。',
    },
  },
  {
    id: 'brain-memory',
    cluster: 'brains',
    title: { en: 'Long-term memory', es: 'Memoria a largo plazo', ja: '長期メモリ' },
    text: {
      en: 'For an assistant to remember each client across conversations, memory works by extracting durable facts about the person from each chat, removing duplicates, and bringing back only the relevant ones in later conversations.',
      es: 'Para que un asistente recuerde a cada cliente entre conversaciones, la memoria funciona extrayendo de cada chat los hechos duraderos sobre la persona, eliminando duplicados y recuperando solo los relevantes en conversaciones posteriores.',
      ja: 'アシスタントが会話をまたいで顧客一人ひとりを覚えておくために、メモリは次のように働きます。各チャットから本人に関する持続的な事実を抽出し、重複を取り除き、以降の会話では関連するものだけを呼び出します。',
    },
  },
  {
    id: 'brain-persona',
    cluster: 'brains',
    title: { en: 'Persona and voice', es: 'Personalidad y voz', ja: 'ペルソナと話し方' },
    text: {
      en: 'Making an assistant sound like a specific person takes more than a prompt: real examples of how they write, response rules enforced in code, and blind tests against the real person.',
      es: 'Conseguir que un asistente suene como una persona concreta requiere más que un prompt: ejemplos reales de cómo escribe, reglas de respuesta aplicadas en código y pruebas a ciegas contra la persona real.',
      ja: 'アシスタントを特定の人物らしく話させるには、プロンプトだけでは足りません。その人が実際に書く文章の例、コードで強制する応答ルール、本人を相手にしたブラインドテストが必要です。',
    },
  },
  {
    id: 'brain-guardrails',
    cluster: 'brains',
    title: {
      en: 'Guardrails outside the model',
      es: 'Barreras fuera del modelo',
      ja: 'モデルの外にあるガードレール',
    },
    text: {
      en: 'To stop a model from making unsupported claims, the checks that matter run in ordinary code, not in the prompt: filters on what goes in and what comes out, and gates that block a claim unless the retrieved evidence supports it.',
      es: 'Para evitar que un modelo haga afirmaciones sin respaldo, las comprobaciones importantes se ejecutan en código normal, no en el prompt: filtros sobre lo que entra y lo que sale, y puertas que bloquean una afirmación si la evidencia recuperada no la respalda.',
      ja: 'モデルが裏付けのない主張をするのを防ぐには、重要なチェックをプロンプトではなく通常のコードで実行します。入力と出力に対するフィルターと、検索した証拠が裏付けない主張をブロックするゲートです。',
    },
  },
  {
    id: 'brain-agents',
    cluster: 'brains',
    title: { en: 'Agents and tools', es: 'Agentes y herramientas', ja: 'エージェントとツール' },
    text: {
      en: 'An agent is a model that decides which tool to call next. I keep each tool small and typed, route by intent before generating, and give the model only the context that the step needs.',
      es: 'Un agente es un modelo que decide qué herramienta llamar a continuación. Mantengo cada herramienta pequeña y tipada, enruto por intención antes de generar y doy al modelo solo el contexto que ese paso necesita.',
      ja: 'エージェントとは、次にどのツールを呼ぶかを自分で決めるモデルです。私は各ツールを小さく型付きに保ち、生成の前に意図でルーティングし、そのステップに必要なコンテキストだけをモデルに渡しています。',
    },
  },
  {
    id: 'brain-correction',
    cluster: 'brains',
    title: {
      en: 'A knowledge base people can correct',
      es: 'Una base de conocimiento que se puede corregir',
      ja: '人が修正できるナレッジベース',
    },
    text: {
      en: 'Knowledge goes stale. Editors should be able to fix what the assistant knows by talking to it, with every change audited and reversible, instead of opening a ticket for an engineer.',
      es: 'El conocimiento caduca. Los editores deben poder corregir lo que sabe el asistente hablando con él, con cada cambio auditado y reversible, en lugar de abrir un ticket a un ingeniero.',
      ja: '知識は古くなります。編集者は、エンジニアにチケットを起票するのではなく、アシスタントと会話することでその知識を修正できるべきです。すべての変更は監査でき、元に戻せるようにします。',
    },
  },
  {
    id: 'brain-structured',
    cluster: 'brains',
    title: { en: 'Structured outputs', es: 'Salidas estructuradas', ja: '構造化出力' },
    text: {
      en: 'When the output of a model feeds another program, it should follow a schema. Structured outputs validated at the boundary turn a paragraph of prose into data the rest of the system can trust.',
      es: 'Cuando la salida de un modelo alimenta a otro programa, debe seguir un esquema. Las salidas estructuradas validadas en el borde convierten un párrafo de prosa en datos en los que el resto del sistema puede confiar.',
      ja: 'モデルの出力が別のプログラムに渡される場合は、スキーマに従う必要があります。境界で検証された構造化出力は、散文の一段落を、システムの他の部分が信頼できるデータに変えます。',
    },
  },

  // ───────────── Evaluation ─────────────
  {
    id: 'eval-why',
    cluster: 'eval',
    title: {
      en: 'Evaluate before you tune',
      es: 'Evalúa antes de ajustar',
      ja: 'チューニングの前に評価する',
    },
    text: {
      en: 'Without a test set you cannot evaluate retrieval, and every change to a RAG system is a guess. I build a set of real questions with expected sources first, and only then compare chunking, fusion or reranking options.',
      es: 'Sin un conjunto de pruebas no se puede evaluar la recuperación, y cada cambio en un sistema RAG es una apuesta. Primero construyo un conjunto de preguntas reales con sus fuentes esperadas, y solo entonces comparo opciones de troceado, fusión o rerank.',
      ja: 'テストセットがなければ検索を評価できず、RAGシステムへの変更はどれも当てずっぽうになります。私はまず、期待する出典つきの実際の質問からなるテストセットを作り、そのうえでチャンキング、融合、リランクの各方式を比較します。',
    },
  },
  {
    id: 'eval-metrics',
    cluster: 'eval',
    title: { en: 'Recall@k and MRR', es: 'Recall@k y MRR', ja: 'Recall@kとMRR' },
    text: {
      en: 'These are the two metrics I use to evaluate retrieval quality. Recall@k asks whether the right document appears in the top k results. MRR rewards putting it near the top. Together they tell you if retrieval finds the answer and how high it ranks it.',
      es: 'Son las dos métricas que uso para evaluar la calidad de la recuperación. Recall@k pregunta si el documento correcto aparece entre los k primeros resultados. MRR premia ponerlo cerca del primero. Juntas dicen si la recuperación encuentra la respuesta y en qué posición la deja.',
      ja: 'これは、検索の品質を評価するために使っている2つの指標です。Recall@kは、正しいドキュメントが上位k件に入っているかを見ます。MRRは、それが上位にあるほど高く評価します。2つを合わせると、検索が答えを見つけられているか、そしてどれだけ上位に置いているかが分かります。',
    },
  },
  {
    id: 'eval-holdout',
    cluster: 'eval',
    title: { en: 'Held-out cases', es: 'Casos de reserva', ja: 'ホールドアウトのケース' },
    text: {
      en: 'If you tune on the same questions you report, the numbers lie. Keeping a held-out split that is never used for tuning shows whether an improvement is real or just overfitting.',
      es: 'Si ajustas con las mismas preguntas con las que informas, los números engañan. Guardar una parte de reserva que nunca se usa para ajustar muestra si una mejora es real o solo sobreajuste.',
      ja: '報告に使うのと同じ質問でチューニングすると、数字は実態を表しません。チューニングに一切使わないホールドアウト分割を確保しておけば、改善が本物なのか、単なる過学習なのかが分かります。',
    },
  },
  {
    id: 'eval-judge',
    cluster: 'eval',
    title: {
      en: 'Model-as-judge, blind',
      es: 'Un modelo como juez, a ciegas',
      ja: 'ブラインドで行う、ジャッジとしてのモデル',
    },
    text: {
      en: 'For qualities like tone, a second model can act as judge in a blind A/B test: it sees two replies, one human and one generated, without knowing which is which.',
      es: 'Para cualidades como el tono, un segundo modelo puede hacer de juez en una prueba A/B a ciegas: ve dos respuestas, una humana y otra generada, sin saber cuál es cuál.',
      ja: 'トーンのような質については、2つ目のモデルがブラインドA/Bテストのジャッジを務められます。人間が書いた返信と生成された返信の2つを、どちらがどちらか知らされずに見比べます。',
    },
  },
  {
    id: 'eval-cost',
    cluster: 'eval',
    title: {
      en: 'Cost and latency are metrics too',
      es: 'El coste y la latencia también son métricas',
      ja: 'コストとレイテンシも指標',
    },
    text: {
      en: 'Every model call should record tokens, cost and latency. Quality that arrives five seconds late or costs too much per answer is not a feature users will get to keep.',
      es: 'Cada llamada al modelo debe registrar tokens, coste y latencia. La calidad que llega cinco segundos tarde o cuesta demasiado por respuesta no es una función que los usuarios vayan a conservar.',
      ja: 'モデルの呼び出しごとに、トークン数、コスト、レイテンシを記録すべきです。5秒遅れて届く品質や、回答1件あたりのコストが高すぎる品質は、ユーザーが使い続けられる機能ではありません。',
    },
  },
  {
    id: 'eval-hallucination',
    cluster: 'eval',
    title: {
      en: 'Measuring hallucination',
      es: 'Medir las alucinaciones',
      ja: 'ハルシネーションの測定',
    },
    text: {
      en: 'Hallucination is measurable: take real answers, check each claim against the data, and count the unsupported ones. That number is what justifies building a claim filter.',
      es: 'La alucinación se puede medir: se toman respuestas reales, se contrasta cada afirmación con los datos y se cuentan las que no tienen respaldo. Ese número es lo que justifica construir un filtro de afirmaciones.',
      ja: 'ハルシネーションは測定できます。実際の回答を取り、各主張をデータと照合し、裏付けのないものを数えます。その数字が、主張フィルターを作る根拠になります。',
    },
  },

  // ───────────── Projects ─────────────
  {
    id: 'proj-sangi',
    cluster: 'projects',
    title: {
      en: 'Sangi — RAG chat over a footwear archive',
      es: 'Sangi — chat RAG sobre un archivo de calzado',
      ja: 'Sangi — デザイナーシューズのアーカイブに対するRAGチャット',
    },
    text: {
      en: 'Sangi is a RAG project we built: a chat over a curated archive of designer footwear. It runs on Supabase with pgvector and HNSW indexes, and retrieves with hybrid search: vector plus lexical results merged by reciprocal rank fusion.',
      es: 'Sangi es un proyecto RAG que hemos construido: un chat sobre un archivo curado de calzado de diseñador. Funciona sobre Supabase con pgvector e índices HNSW, y recupera con búsqueda híbrida: resultados vectoriales y léxicos fusionados por rango recíproco.',
      ja: 'SangiはRAGプロジェクトで、厳選されたデザイナーシューズのアーカイブに対するチャットを構築しました。Supabase上でpgvectorとHNSWインデックスを使って動き、検索にはハイブリッド検索を採用しています。ベクトル検索とキーワード検索の結果を逆順位融合(RRF)で統合します。',
    },
  },
  {
    id: 'proj-sangi-eval',
    cluster: 'projects',
    title: {
      en: 'Sangi — the reranker we rejected',
      es: 'Sangi — el reranker que descartamos',
      ja: 'Sangi — 不採用にしたリランカー',
    },
    text: {
      en: 'On Sangi we compared retrieval variants on 103 cases. Rank fusion reached an MRR of 0.73 on the held-out split, against 0.70 for normalised scores, and a reranker was rejected because it lowered recall@10 from 0.92 to 0.85 and added about 4.8 seconds.',
      es: 'En Sangi comparamos variantes de recuperación con 103 casos. La fusión por rango alcanzó un MRR de 0,73 en la parte de reserva, frente a 0,70 con puntuaciones normalizadas, y se descartó un reranker porque bajaba el recall@10 de 0,92 a 0,85 y añadía unos 4,8 segundos.',
      ja: 'Sangiでは、103件のケースで検索の各方式を比較しました。逆順位融合(RRF)はホールドアウト分割でMRR 0.73を記録し(スコア正規化は0.70)、リランカーはrecall@10を0.92から0.85に下げ、約4.8秒を加えたため不採用としました。',
    },
  },
  {
    id: 'proj-sangi-gate',
    cluster: 'projects',
    title: {
      en: 'Sangi — the claim gate',
      es: 'Sangi — la puerta de afirmaciones',
      ja: 'Sangi — 主張ゲート',
    },
    text: {
      en: 'An audit of real Sangi chat answers found unsupported claims in 26 of 36. The fix was a deterministic claim gate and evidence gate that run outside the model and block what the data does not back.',
      es: 'Una auditoría de respuestas reales del chat de Sangi encontró afirmaciones sin respaldo en 26 de 36. La solución fue una puerta de afirmaciones y otra de evidencia, deterministas, que se ejecutan fuera del modelo y bloquean lo que los datos no respaldan.',
      ja: 'Sangiの実際のチャット回答を監査したところ、36件中26件に裏付けのない主張がありました。対策として、モデルの外で動作し、データが裏付けないものをブロックする、決定論的な主張ゲートと証拠ゲートを作りました。',
    },
  },
  {
    id: 'proj-jairo',
    cluster: 'projects',
    title: {
      en: 'JairoFitness — a RAG project: an AI coach with a real voice',
      es: 'JairoFitness — proyecto RAG: un coach de IA con voz real',
      ja: 'JairoFitness — RAGプロジェクト: 本物の声を持つAIコーチ',
    },
    text: {
      en: 'JairoFitness is a RAG project we built for online fitness coaching: an AI assistant that, in text and voice, answers with the personality of the real coach. It combines a pgvector knowledge base, reviewed coaching cases and long-term memory of each client.',
      es: 'JairoFitness es un proyecto RAG que hemos construido para coaching de fitness online: un asistente de IA que, por texto y voz, responde con la personalidad del coach real. Combina una base de conocimiento en pgvector, casos de coaching revisados y memoria a largo plazo de cada cliente.',
      ja: 'JairoFitnessは、オンラインのフィットネスコーチング向けに私たちが構築したRAGプロジェクトです。テキストでも音声でも、本物のコーチの人柄で答えるAIアシスタントで、pgvectorのナレッジベース、レビュー済みのコーチングの事例、顧客ごとの長期メモリを組み合わせています。',
    },
  },
  {
    id: 'proj-jairo-eval',
    cluster: 'projects',
    title: {
      en: 'JairoFitness — tested against the human',
      es: 'JairoFitness — probado contra el humano',
      ja: 'JairoFitness — 人間を相手にしたテスト',
    },
    text: {
      en: 'In blind A/B tests on JairoFitness, the judge mistook the AI for the real coach about 31% of the time. An output filter that stops internal notes reaching clients had zero false positives over 5,041 real lines. A chat reply takes about 1.7 s at p95.',
      es: 'En pruebas A/B a ciegas en JairoFitness, el juez confundió a la IA con el coach real cerca del 31 % de las veces. Un filtro de salida que impide que las notas internas lleguen al cliente dio cero falsos positivos sobre 5.041 líneas reales. Una respuesta de chat tarda unos 1,7 s en el p95.',
      ja: 'JairoFitnessのブラインドA/Bテストでは、ジャッジが約31%の確率でAIを本物のコーチと取り違えました。内部メモが顧客に届くのを防ぐ出力フィルターは、実際の5,041行で誤検知がゼロでした。チャット応答のp95レイテンシは約1.7秒です。',
    },
  },
  {
    id: 'proj-market',
    cluster: 'projects',
    title: {
      en: 'Market Movers — AI inside a CRM',
      es: 'Market Movers — IA dentro de un CRM',
      ja: 'Market Movers — CRMの中のAI',
    },
    text: {
      en: 'Market Movers is a B2B CRM with AI features: meeting briefs where every statement cites its source, cached by a hash of the deal context, plus proposal drafting, business-card extraction and voice notes, all with token and cost telemetry.',
      es: 'Market Movers es un CRM B2B con funciones de IA: briefs de reunión donde cada afirmación cita su fuente, cacheados por un hash del contexto del negocio, además de redacción de propuestas, lectura de tarjetas de visita y notas de voz, todo con telemetría de tokens y coste.',
      ja: 'Market Moversは、AI機能を備えたB2B向けCRMです。すべての記述が出典を示す会議ブリーフを、案件コンテキストのハッシュでキャッシュして提供するほか、提案書の作成、名刺の読み取り、音声メモにも対応し、すべてトークンとコストのテレメトリー付きです。',
    },
  },
  {
    id: 'proj-platforms',
    cluster: 'projects',
    title: {
      en: 'Full-stack platforms',
      es: 'Plataformas full stack',
      ja: 'フルスタックのプラットフォーム',
    },
    text: {
      en: 'Beyond AI, I work on full-stack products: Proyectasport, a school sports platform with role-based permissions and signed links for families; Catalyst, an HR tool with optimistic concurrency; and an investment ERP for Private Equity Club.',
      es: 'Más allá de la IA, trabajo en productos full stack: Proyectasport, una plataforma de deporte escolar con permisos por rol y enlaces firmados para las familias; Catalyst, una herramienta de RR. HH. con concurrencia optimista; y un ERP de inversión para Private Equity Club.',
      ja: 'AI以外にも、フルスタックのプロダクトに取り組んでいます。学校スポーツ向けのプラットフォームで、ロールベースの権限と家族向けの署名付きリンクを備えたProyectasport、楽観的同時実行制御を使った人事ツールのCatalyst、そしてPrivate Equity Club向けの投資ERPです。',
    },
  },
  {
    id: 'proj-crm',
    cluster: 'projects',
    title: {
      en: 'Abacus — a CRM that pays commissions',
      es: 'Abacus — un CRM que paga comisiones',
      ja: 'Abacus — コミッションを支払うCRM',
    },
    text: {
      en: 'Abacus is the codename of a sales CRM built on an open-source one, extended only through its extension points so the original can still be merged. The commission split between salespeople is configuration, and each won deal freezes an immutable copy of it.',
      es: 'Abacus es el nombre en clave de un CRM de ventas montado sobre uno de código abierto, ampliado solo por sus puntos de extensión para poder seguir integrando el original. El reparto de comisiones entre comerciales es configuración, y cada venta ganada congela una copia inmutable.',
      ja: 'Abacusは、オープンソースのCRMをベースに構築した営業向けCRMのコードネームです。元のCRMを引き続きマージできるよう、拡張ポイントだけを使って拡張しています。営業担当者間のコミッション配分は設定で管理し、受注した案件ごとに、その不変のコピーを固定します。',
    },
  },
  {
    id: 'proj-web-geo',
    cluster: 'projects',
    title: {
      en: 'Websites that AI search can read',
      es: 'Webs que la búsqueda con IA sabe leer',
      ja: 'AI検索が読めるウェブサイト',
    },
    text: {
      en: 'Pitlane, Showhome and Signpost are codenames of client websites: a car dealership, a home staging business and a bilingual company site. The server pre-renders text and structured data so crawlers with no JavaScript can read them; on Showhome the AI-search audit went from 37 to 68.',
      es: 'Pitlane, Showhome y Signpost son nombres en clave de webs de cliente: un concesionario, un negocio de home staging y una web corporativa bilingüe. El servidor prerrenderiza el texto y los datos estructurados para que los rastreadores sin JavaScript puedan leerlas; en Showhome la auditoría de búsqueda con IA pasó de 37 a 68.',
      ja: 'Pitlane、Showhome、Signpostは、クライアントのウェブサイトのコードネームで、それぞれ自動車ディーラー、ホームステージングの事業、バイリンガルの企業サイトです。サーバーがテキストと構造化データをプリレンダリングするので、JavaScriptを実行しないクローラーでも読めます。Showhomeでは、AI検索の監査スコアが37から68に上がりました。',
    },
  },
  {
    id: 'proj-pipeline',
    cluster: 'projects',
    title: {
      en: 'Pitchsmith — sales call to proposal',
      es: 'Pitchsmith — de la llamada a la propuesta',
      ja: 'Pitchsmith — 営業電話から提案書まで',
    },
    text: {
      en: 'Pitchsmith is the codename of an internal tool that turns the transcript of a sales call into a written proposal in two stages. The first extracts strict JSON where each proposed solution must point to a pain the client voiced; the second writes the document and exports it as PDF.',
      es: 'Pitchsmith es el nombre en clave de una herramienta interna que convierte la transcripción de una llamada comercial en una propuesta escrita en dos fases. La primera extrae JSON estricto donde cada solución propuesta debe apuntar a un problema que el cliente dijo; la segunda redacta el documento y lo exporta a PDF.',
      ja: 'Pitchsmithは、営業電話の文字起こしを2段階で提案書に変える社内ツールのコードネームです。第1段階では厳密なJSONを抽出し、提案する各ソリューションは、クライアントが口にした課題に対応していなければなりません。第2段階で文書を書き、PDFとして出力します。',
    },
  },
  {
    id: 'proj-payments',
    cluster: 'projects',
    title: {
      en: 'Payments and subscriptions',
      es: 'Pagos y suscripciones',
      ja: '決済とサブスクリプション',
    },
    text: {
      en: 'Kettlebell and Apothecary are codenames of two products that charge by card: a subscription fitness app I contributed to and a skincare shop. In both, the payment gateway signature is verified on the server, and in the app only an idempotent webhook can grant access.',
      es: 'Kettlebell y Apothecary son nombres en clave de dos productos que cobran con tarjeta: una app de fitness por suscripción en la que colaboré y una tienda de cuidado de la piel. En ambos la firma de la pasarela de pago se verifica en el servidor, y en la app solo un webhook idempotente puede conceder el acceso.',
      ja: 'KettlebellとApothecaryは、カード決済を扱う2つのプロダクトのコードネームで、私が開発に参加したサブスクリプション型のフィットネスアプリと、スキンケアのショップです。どちらも決済ゲートウェイの署名をサーバーで検証しており、アプリではべき等なWebhookだけがアクセス権を付与できます。',
    },
  },

  // ───────────── About ─────────────
  {
    id: 'about-me',
    cluster: 'about',
    title: { en: 'Who I am', es: 'Quién soy', ja: '自己紹介' },
    text: {
      en: 'I am Alejandro Tiscar, an AI engineer. I build retrieval systems, assistants with memory and the evaluation that keeps them honest, working with the team at The AI Business.',
      es: 'Soy Alejandro Tiscar, ingeniero de IA. Construyo sistemas de recuperación, asistentes con memoria y la evaluación que los mantiene honestos, trabajando con el equipo de The AI Business.',
      ja: '私はAlejandro Tiscarです。AIエンジニアとして、検索システムや、メモリを持つアシスタント、それらを正直に保つための評価を作っています。The AI Businessのチームと一緒に仕事をしています。',
    },
  },
  {
    id: 'about-stack',
    cluster: 'about',
    title: { en: 'My stack', es: 'Mi stack', ja: '使っている技術スタック' },
    text: {
      en: 'My daily tools are TypeScript, Python, React and Next.js on the front, Node with Express or NestJS on the back, PostgreSQL with Prisma and Supabase, and deployments on Railway.',
      es: 'Mis herramientas diarias son TypeScript, Python, React y Next.js en el front, Node con Express o NestJS en el back, PostgreSQL con Prisma y Supabase, y despliegues en Railway.',
      ja: '日々使っているツールは、TypeScript、Python、フロントエンドのReactとNext.js、バックエンドのExpressまたはNestJSを使ったNode、PrismaとSupabaseを使ったPostgreSQLで、デプロイにはRailwayを使っています。',
    },
  },
  {
    id: 'about-passion',
    cluster: 'about',
    title: {
      en: 'Why AI brains',
      es: 'Por qué los cerebros de IA',
      ja: 'AIブレインに惹かれる理由',
    },
    text: {
      en: 'What fascinates me is that meaning can be turned into geometry. I love science fiction and algorithms that feel taken from it, and a knowledge base you can talk to is the closest thing I have built to one.',
      es: 'Lo que me fascina es que el significado se pueda convertir en geometría. Me encantan la ciencia ficción y los algoritmos que parecen sacados de ella, y una base de conocimiento con la que se puede hablar es lo más parecido que he construido.',
      ja: '私が魅了されているのは、意味を幾何学に変換できるという点です。SFと、そこから抜け出してきたようなアルゴリズムが大好きで、対話できるナレッジベースは、私がこれまでに作ったものの中でそれに最も近いものです。',
    },
  },
  {
    id: 'about-how',
    cluster: 'about',
    title: { en: 'How I work', es: 'Cómo trabajo', ja: '仕事の進め方' },
    text: {
      en: 'I ship in small steps with tests, typed contracts and continuous integration. I would rather show a number from an evaluation than an opinion, and I write down why a decision was taken.',
      es: 'Entrego en pasos pequeños con tests, contratos tipados e integración continua. Prefiero enseñar un número de una evaluación que una opinión, y dejo por escrito por qué se tomó cada decisión.',
      ja: 'テスト、型付きのコントラクト、継続的インテグレーションを備え、小さなステップでリリースします。意見よりも評価で得られた数字を示すことを好み、なぜその判断をしたのかを文書に残します。',
    },
  },
  {
    id: 'about-site',
    cluster: 'about',
    title: { en: 'How this site works', es: 'Cómo funciona esta web', ja: 'このサイトの仕組み' },
    text: {
      en: 'This portfolio is a static site. A build script embeds every fragment with a multilingual model and saves the vectors; the search, the ranking and the games you play here run on those real vectors in your browser.',
      es: 'Este portfolio es una web estática. Un script de compilación vectoriza cada fragmento con un modelo multilingüe y guarda los vectores; la búsqueda, el ranking y los juegos que ves aquí funcionan sobre esos vectores reales en tu navegador.',
      ja: 'このポートフォリオは静的サイトです。ビルドスクリプトが多言語モデルですべての断片を埋め込み、ベクトルを保存します。ここで使える検索、ランキング、ゲームは、そのベクトルをもとに、あなたのブラウザー上で動いています。',
    },
  },
  {
    id: 'about-contact',
    cluster: 'about',
    title: { en: 'Looking for', es: 'Qué busco', ja: '求めているもの' },
    text: {
      en: 'I am looking for a role as an AI engineer where retrieval, knowledge bases and assistants are the product, not a side feature. You can reach me by email or on GitHub.',
      es: 'Busco un puesto de ingeniero de IA donde la recuperación, las bases de conocimiento y los asistentes sean el producto y no un añadido. Puedes escribirme por email o en GitHub.',
      ja: 'AIエンジニアとして、検索、ナレッジベース、アシスタントが付随機能ではなくプロダクトそのものであるポジションを探しています。連絡はメールまたはGitHubでお願いします。',
    },
  },
];
