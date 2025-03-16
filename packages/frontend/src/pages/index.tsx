import { useEffect, useState } from 'react';
import { MinecraftServer } from '@kokoa-home-mc-dns-manager/shared';
import { ServerList } from '../components/ServerList';
import { ServerForm } from '../components/ServerForm';
import { fetchServers } from '../utils/api';

export default function Home() {
  const [servers, setServers] = useState<MinecraftServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // サーバー一覧を取得
  const loadServers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServers();
      setServers(data);
    } catch (err) {
      setError('サーバー一覧の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード時にサーバー一覧を取得
  useEffect(() => {
    loadServers();
    
    // 定期的に更新
    const interval = setInterval(loadServers, 60000); // 1分ごとに更新
    
    return () => clearInterval(interval);
  }, []);

  // サーバー作成後の処理
  const handleServerCreated = () => {
    setShowForm(false);
    loadServers();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">マインクラフトDNSマネージャー</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        {showForm ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">新規サーバー登録</h2>
            <ServerForm onSuccess={handleServerCreated} onCancel={() => setShowForm(false)} />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            サーバー新規作成
          </button>
        )}
      </div>
      
      <div>
        {loading ? (
          <p>読み込み中...</p>
        ) : servers.length === 0 ? (
          <p>登録されているサーバーはありません</p>
        ) : (
          <ServerList servers={servers} onServerDeleted={loadServers} />
        )}
      </div>
    </div>
  );
}
