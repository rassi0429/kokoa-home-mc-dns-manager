import { useEffect, useState } from 'react';
import { fetchServer } from '../utils/api';

interface ServerStatusProps {
    serverId: string;
}

interface StatusData {
    isOnline: boolean;
    playerCount: number;
    maxPlayers: number;
    motd?: string;
    version?: string;
    lastCheckedAt: Date;
}

export function ServerStatus({ serverId }: ServerStatusProps) {
    const [status, setStatus] = useState<StatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // サーバーステータスを取得
    const loadStatus = async () => {
        try {
            setLoading(true);
            setError(null);

            const server = await fetchServer(serverId);

            // サーバーの最新ステータスを取得
            if (server.statuses && server.statuses.length > 0) {
                // 最新のステータスを取得
                const latestStatus = server.statuses.sort((a, b) => {
                    return new Date(b.lastCheckedAt).getTime() - new Date(a.lastCheckedAt).getTime();
                })[0];

                setStatus({
                    isOnline: latestStatus.isOnline,
                    playerCount: latestStatus.playerCount,
                    maxPlayers: latestStatus.maxPlayers,
                    motd: latestStatus.motd,
                    version: latestStatus.version,
                    lastCheckedAt: new Date(latestStatus.lastCheckedAt),
                });
            } else {
                setStatus(null);
            }
        } catch (err) {
            setError('ステータスの取得に失敗しました');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 初回ロード時にステータスを取得
    useEffect(() => {
        loadStatus();

        // 定期的に更新
        const interval = setInterval(loadStatus, 60000); // 1分ごとに更新

        return () => clearInterval(interval);
    }, [serverId]);

    if (loading) {
        return <div className="text-gray-500">読み込み中...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!status) {
        return <div className="text-gray-500">ステータスなし</div>;
    }

    return (
        <div className="text-right">
            <div className={`font-semibold ${status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {status.isOnline ? 'オンライン' : 'オフライン'}
            </div>

            {status.isOnline && (
                <>
                    <div className="text-sm text-gray-600">
                        プレイヤー: {status.playerCount}/{status.maxPlayers}
                    </div>

                    {status.version && (
                        <div className="text-xs text-gray-500">
                            {status.version}
                        </div>
                    )}

                    {status.motd && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                            "{status.motd}"
                        </div>
                    )}
                </>
            )}

            <div className="text-xs text-gray-400 mt-1">
                最終確認: {status.lastCheckedAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
            </div>
        </div>
    );
}
