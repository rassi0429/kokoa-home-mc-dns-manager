import { useState } from 'react';
import { MinecraftServer } from '@kokoa-home-mc-dns-manager/shared';
import { deleteServer, importDnsRecords } from '../utils/api';
import { ServerStatus } from './ServerStatus';
import { ServerForm } from './ServerForm';

interface ServerListProps {
  servers: MinecraftServer[];
  onServerDeleted: () => void;
}

export function ServerList({ servers, onServerDeleted }: ServerListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDomain, setImportDomain] = useState('');
  const [editingServer, setEditingServer] = useState<MinecraftServer | null>(null);

  // DNSレコードをインポートする
  const handleImport = async () => {
    try {
      setIsImporting(true);
      setError(null);
      setSuccess(null);
      
      const result = await importDnsRecords(importDomain || undefined);
      
      // 改行をHTMLの改行に変換
      const formattedMessage = result.message.replace(/\n/g, '<br />');
      setSuccess(formattedMessage);
      
      setShowImportModal(false);
      setImportDomain('');
      onServerDeleted(); // サーバーリストを更新
    } catch (err) {
      setError('DNSレコードのインポートに失敗しました');
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  // サーバーを削除する
  const handleDelete = async (id: string) => {
    if (!confirm('本当にこのサーバーを削除しますか？')) {
      return;
    }
    
    try {
      setDeletingId(id);
      setError(null);
      await deleteServer(id);
      onServerDeleted();
    } catch (err) {
      setError('サーバーの削除に失敗しました');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div 
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          dangerouslySetInnerHTML={{ __html: success }}
        />
      )}
      
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">サーバー一覧</h2>
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          DNSレコードをインポート
        </button>
      </div>
      
      {/* インポートモーダル */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">DNSレコードをインポート</h3>
            <p className="mb-4 text-gray-600">
              CloudFlareからマインクラフトのSRVレコードをインポートします。
              ドメイン名を指定すると、そのドメインとすべてのサブドメインのレコードをインポートします。
              空白の場合は、すべてのマインクラフトSRVレコードをインポートします。
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                ドメイン名（オプション、サブドメインも含む）
              </label>
              <input
                type="text"
                value={importDomain}
                onChange={(e) => setImportDomain(e.target.value)}
                placeholder="例: example.com"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
              >
                キャンセル
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isImporting ? 'インポート中...' : 'インポート'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {servers.map(server => (
          <div
            key={server.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{server.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{server.dnsRecord}</p>
                <p className="text-gray-600 text-sm">
                  接続先: {server.targetIp}:{server.targetPort}
                </p>
                <p className="text-gray-600 text-sm">
                  ターゲットホスト名: {server.targetHostname}
                </p>
              </div>
              
              <ServerStatus serverId={server.id!} />
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditingServer(server)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(server.id!)}
                disabled={deletingId === server.id}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                {deletingId === server.id ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* 編集モーダル */}
      {editingServer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">サーバー設定の編集</h3>
            <ServerForm 
              server={editingServer} 
              onSuccess={() => {
                setEditingServer(null);
                onServerDeleted(); // サーバーリストを更新
                setSuccess('サーバー設定を更新しました');
              }} 
              onCancel={() => setEditingServer(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
