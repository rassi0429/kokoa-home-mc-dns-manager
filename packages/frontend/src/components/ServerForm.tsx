import { useState, useEffect } from 'react';
import { MinecraftServer } from '@kokoa-home-mc-dns-manager/shared';
import { MinecraftServerSchema } from '@kokoa-home-mc-dns-manager/shared';
import { splitIpAndPort } from '@kokoa-home-mc-dns-manager/shared';
import { createServer, updateServer } from '../utils/api';

interface ServerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  server?: MinecraftServer; // 編集モードの場合に渡されるサーバー情報
}

export function ServerForm({ onSuccess, onCancel, server }: ServerFormProps) {
  const [name, setName] = useState(server?.name || '');
  const [dnsRecord, setDnsRecord] = useState(server?.dnsRecord || '');
  const [targetAddress, setTargetAddress] = useState(server ? `${server.targetIp}:${server.targetPort}` : '');
  const [targetHostname, setTargetHostname] = useState(server?.targetHostname || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 編集モード時にサーバー情報が変更された場合、フォームの値を更新
  useEffect(() => {
    if (server) {
      setName(server.name);
      setDnsRecord(server.dnsRecord);
      setTargetAddress(`${server.targetIp}:${server.targetPort}`);
      setTargetHostname(server.targetHostname);
    }
  }, [server]);
  
  // 編集モードかどうかを判定
  const isEditMode = !!server;

  // フォームを送信する
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setErrors({});
      
      // IPアドレスとポートを分割
      let targetIp = '';
      let targetPort = 0;
      
      try {
        [targetIp, targetPort] = splitIpAndPort(targetAddress);
      } catch (err) {
        setErrors({
          ...errors,
          targetAddress: '正しい形式で入力してください (例: 192.168.1.1:25565)',
        });
        return;
      }
      
      // サーバーデータを作成
      const serverData: MinecraftServer = {
        name,
        dnsRecord,
        targetIp,
        targetHostname,
        targetPort,
        ...(isEditMode && { id: server.id }), // 編集モードの場合はIDを含める
      };
      
      // バリデーション
      const validationResult = MinecraftServerSchema.safeParse(serverData);
      
      if (!validationResult.success) {
        const formattedErrors: Record<string, string> = {};
        const formErrors = validationResult.error.format();
        
        if (formErrors.name?._errors) {
          formattedErrors.name = formErrors.name._errors[0];
        }
        
        if (formErrors.dnsRecord?._errors) {
          formattedErrors.dnsRecord = formErrors.dnsRecord._errors[0];
        }
        
        if (formErrors.targetIp?._errors) {
          formattedErrors.targetAddress = formErrors.targetIp._errors[0];
        }
        
        if (formErrors.targetHostname?._errors) {
          formattedErrors.targetHostname = formErrors.targetHostname._errors[0];
        }
        
        if (formErrors.targetPort?._errors) {
          formattedErrors.targetAddress = formErrors.targetPort._errors[0];
        }
        
        setErrors(formattedErrors);
        return;
      }
      
      if (isEditMode) {
        // サーバーを更新
        await updateServer(server.id!, serverData);
      } else {
        // サーバーを作成
        await createServer(serverData);
      }
      
      // 成功時の処理
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrors({
        form: isEditMode ? 'サーバーの更新に失敗しました' : 'サーバーの作成に失敗しました',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.form}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          サーバー名
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="マイサーバー"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="dnsRecord" className="block text-sm font-medium text-gray-700 mb-1">
          DNSレコード
        </label>
        <input
          type="text"
          id="dnsRecord"
          value={dnsRecord}
          onChange={(e) => setDnsRecord(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.dnsRecord ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="mc-instance1.kokoa.dev"
        />
        {errors.dnsRecord && <p className="mt-1 text-sm text-red-500">{errors.dnsRecord}</p>}
      </div>
      
      <div>
        <label htmlFor="targetAddress" className="block text-sm font-medium text-gray-700 mb-1">
          接続先アドレス
        </label>
        <input
          type="text"
          id="targetAddress"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.targetAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="192.168.1.1:25565"
        />
        {errors.targetAddress && (
          <p className="mt-1 text-sm text-red-500">{errors.targetAddress}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          形式: IPアドレス:ポート番号
        </p>
      </div>
      
      <div>
        <label htmlFor="targetHostname" className="block text-sm font-medium text-gray-700 mb-1">
          ターゲットホスト名
        </label>
        <input
          type="text"
          id="targetHostname"
          value={targetHostname}
          onChange={(e) => setTargetHostname(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.targetHostname ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="mc-server.example.com"
        />
        {errors.targetHostname && (
          <p className="mt-1 text-sm text-red-500">{errors.targetHostname}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          SRVレコードのターゲットとなるホスト名
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? (isEditMode ? '更新中...' : '作成中...') : (isEditMode ? '更新' : '作成')}
        </button>
      </div>
    </form>
  );
}
