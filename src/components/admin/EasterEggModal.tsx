import React, { useState, useEffect } from 'react';
import { Gift, X, Check, AlertCircle, Sparkles, Clock } from 'lucide-react';

interface EasterEggModalProps {
  onClose: () => void;
}

export function EasterEggModal({ onClose }: EasterEggModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    title: '活動彩蛋',
    enable: false,
    triggerMode: 'keyboard' as 'keyboard' | 'theme_sequence',
    secretKeysStr: '上, 上, 下, 下, 左, 右, 左, 右, B, A',
    couponCode: '',
    startDate: '',
    endDate: '',
    message: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/easter-egg');
      const data = await res.json();
      if (data && data.config) {
        const c = data.config;
        const keys = Array.isArray(c.secretKeyList)
          ? c.secretKeyList.join(', ')
          : String(c.secretKeyList || '');

        setFormData({
          id: c.id,
          title: c.title || '活動彩蛋',
          enable: !!c.enable,
          triggerMode: c.triggerMode || 'keyboard',
          secretKeysStr: keys || '上, 上, 下, 下, 左, 右, 左, 右, B, A',
          couponCode: c.couponCode || '',
          startDate: c.startDate || '',
          endDate: c.endDate || '',
          message: c.message || '',
        });
      }
    } catch (err: any) {
      setError('無法載入彩蛋設定');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setStatusMessage('');

    const secretKeyList = formData.secretKeysStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/easter-egg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          title: formData.title,
          enable: formData.enable,
          triggerMode: formData.triggerMode,
          secretKeyList,
          couponCode: formData.couponCode,
          startDate: formData.startDate,
          endDate: formData.endDate,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '儲存失敗');

      setStatusMessage('✨ 彩蛋設定已成功儲存至 D1 資料庫，前台即時生效！');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1A1A1A] rounded-sm max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-[#1A1A1A] text-white flex items-center justify-center">
              <Gift className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">全站彩蛋與折扣設定</h3>
              <p className="text-[11px] text-[#888888]">
                伺服器端（D1）真加密驗證，儲存立即生效，不需重新部署網站
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-[#1A1A1A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div className="bg-[#E6F4EA] border border-[#A8DAB5] text-[#059669] p-2.5 rounded-sm flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-[#FDE8E7] border border-[#F8B4B1] text-[#D9453B] p-2.5 rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-[#888888]">載入彩蛋設定中...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Enable toggle */}
            <div className="flex items-center justify-between bg-[#FAF8F5] p-3 rounded-sm border border-[#E5E0D8]">
              <div>
                <span className="font-bold text-[#1A1A1A]">啟用彩蛋活動</span>
                <p className="text-[11px] text-[#666666]">
                  關閉時，前台即使輸入密鑰也不會觸發任何彩蛋
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enable}
                  onChange={(e) => setFormData({ ...formData, enable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#E5E0D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#C8C2B8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#059669]"></div>
              </label>
            </div>

            {/* Trigger Mode */}
            <div>
              <label className="block text-[#666666] mb-1 font-medium">觸發模式</label>
              <select
                value={formData.triggerMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    triggerMode: e.target.value as 'keyboard' | 'theme_sequence',
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
              >
                <option value="keyboard">鍵盤按鍵序列 (如 Konami Code: 上上下下左右左右BA)</option>
                <option value="theme_sequence">主題色彩切換序列</option>
              </select>
            </div>

            {/* Secret Keys List */}
            <div>
              <label className="block text-[#666666] mb-1 font-medium">
                通關序列（以逗號分隔）
              </label>
              <input
                type="text"
                value={formData.secretKeysStr}
                onChange={(e) => setFormData({ ...formData, secretKeysStr: e.target.value })}
                placeholder="例如：上, 上, 下, 下, 左, 右, 左, 右, B, A"
                className="w-full px-2.5 py-1.5 font-mono bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
              />
              <span className="text-[10px] text-[#888888] mt-0.5 block">
                方向鍵可用：上、下、左、右；英文字母不分大小寫。
              </span>
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-[#666666] mb-1 font-medium">
                解鎖獲得的優惠碼 (Coupon Code)
              </label>
              <input
                type="text"
                value={formData.couponCode}
                onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                placeholder="例如：adbnMay50"
                className="w-full px-2.5 py-1.5 font-mono bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#666666] font-medium">活動開始時間</label>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const pad = (n: number) => String(n).padStart(2, '0');
                      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
                      setFormData({ ...formData, startDate: formatted });
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#059669] hover:underline cursor-pointer"
                    title="帶入目前系統時間"
                  >
                    <Clock className="w-3 h-3" />
                    <span>現在時間</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="flex-1 px-2.5 py-1.5 font-mono bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <input
                    type="datetime-local"
                    title="點擊日曆選擇日期時間"
                    value={(() => {
                      try {
                        const d = new Date(formData.startDate.replace(' ', 'T'));
                        if (isNaN(d.getTime())) return '';
                        const pad = (n: number) => String(n).padStart(2, '0');
                        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      } catch {
                        return '';
                      }
                    })()}
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({ ...formData, startDate: e.target.value.replace('T', ' ') });
                      }
                    }}
                    className="w-8 h-[34px] px-1 bg-white border border-[#E5E0D8] rounded-sm cursor-pointer hover:border-[#1A1A1A]"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#666666] font-medium">活動結束時間</label>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      now.setDate(now.getDate() + 30);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 23:59`;
                      setFormData({ ...formData, endDate: formatted });
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#059669] hover:underline cursor-pointer"
                    title="快速帶入一個月後"
                  >
                    <Clock className="w-3 h-3" />
                    <span>+30天</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="flex-1 px-2.5 py-1.5 font-mono bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <input
                    type="datetime-local"
                    title="點擊日曆選擇日期時間"
                    value={(() => {
                      try {
                        const d = new Date(formData.endDate.replace(' ', 'T'));
                        if (isNaN(d.getTime())) return '';
                        const pad = (n: number) => String(n).padStart(2, '0');
                        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      } catch {
                        return '';
                      }
                    })()}
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({ ...formData, endDate: e.target.value.replace('T', ' ') });
                      }
                    }}
                    className="w-8 h-[34px] px-1 bg-white border border-[#E5E0D8] rounded-sm cursor-pointer hover:border-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            {/* Message Markdown */}
            <div>
              <label className="block text-[#666666] mb-1 font-medium">
                解鎖彈窗內的展示訊息 (Markdown)
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="恭喜你找到隱藏優惠！\n在委託表單中輸入優惠碼..."
                className="w-full px-2.5 py-1.5 font-serif bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs border border-[#E5E0D8] hover:bg-[#EAE5DC] rounded-sm cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 text-xs font-semibold bg-[#1A1A1A] text-white hover:bg-[#333333] rounded-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? '儲存中...' : '儲存設定'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
