import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";

interface Message {
  _id: string;
  author: string;
  body: string;
  isTemporary?: boolean;
}

function App() {
  const messages = useQuery(api.messages.list) || [];
  const sendMessage = useMutation(api.messages.send);
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isAgentResponding, setIsAgentResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージを結合（Convexのメッセージ + ローカルの一時メッセージ）
  const allMessages = [...messages, ...localMessages.filter(msg => msg.isTemporary)];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAgentResponding) return;

    const userMessage = input.trim();
    setInput("");

    // ユーザーメッセージを送信
    await sendMessage({ author: "User", body: userMessage });

    // エージェント応答開始 - 一時的な「考え中...」メッセージを追加
    setIsAgentResponding(true);
    const tempId = `temp-${Date.now()}`;
    setLocalMessages([{
      _id: tempId,
      author: "Agent",
      body: "考え中...",
      isTemporary: true
    }]);

    try {
      // Mastraエージェントとの通信をシミュレート
      await streamAgentResponse(userMessage, tempId);
    } catch (error) {
      console.error("エージェント応答エラー:", error);
      // エラー時は一時メッセージを削除し、エラーメッセージを送信
      setLocalMessages([]);
      await sendMessage({ author: "Agent", body: "申し訳ございません。エラーが発生しました。" });
    } finally {
      setIsAgentResponding(false);
    }
  };

  const streamAgentResponse = async (userMessage: string, tempId: string) => {
    // ストリーミング応答をシミュレート
    // 実際のMastraエージェントAPIに置き換える必要があります
    const responses = [
      "考え中...",
      "あなたの質問について考えています...",
      "情報を整理しています...",
      `「${userMessage}」について回答いたします。これは非常に興味深い質問ですね。詳しく説明させていただきます。`
    ];

    for (let i = 0; i < responses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
      
      if (i === responses.length - 1) {
        // 最終応答 - 一時メッセージを削除し、正式なメッセージとして保存
        setLocalMessages([]);
        await sendMessage({ author: "Agent", body: responses[i] });
      } else {
        // 中間応答 - 一時メッセージを更新
        setLocalMessages([{
          _id: tempId,
          author: "Agent",
          body: responses[i],
          isTemporary: true
        }]);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Mastra Chat
      </h1>
      
      {/* メッセージ一覧 */}
      <div style={{
        flex: 1,
        overflowY: 'scroll',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {allMessages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            メッセージを送信してチャットを開始してください
          </p>
        ) : (
          allMessages.map((message) => (
            <div key={message._id} style={{
              marginBottom: '15px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: message.author === 'User' ? '#e3f2fd' : '#f1f8e9',
              opacity: message.isTemporary ? 0.7 : 1
            }}>
              <strong>{message.author}:</strong>
              <div style={{ marginTop: '5px' }}>{message.body}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力フォーム */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力してください..."
          disabled={isAgentResponding}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isAgentResponding}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isAgentResponding ? '#ccc' : '#007bff',
            color: 'white',
            fontSize: '16px',
            cursor: isAgentResponding ? 'not-allowed' : 'pointer'
          }}
        >
          {isAgentResponding ? '応答中...' : '送信'}
        </button>
      </form>
    </div>
  );
}

export default App;