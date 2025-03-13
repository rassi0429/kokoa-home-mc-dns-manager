import { useState } from 'react';
import { MinecraftServer } from '@kokoa-home-mc-dns-manager/shared';
import { deleteServer } from '../utils/api';
import { ServerStatus } from './ServerStatus';

interface ServerListProps {
  servers: MinecraftServer[];
  onServerDeleted: () => void;
}

export function ServerList({ servers, onServerDeleted }: ServerListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            
            <div className="mt-4 flex justify-end">
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
    </div>
  );
}
