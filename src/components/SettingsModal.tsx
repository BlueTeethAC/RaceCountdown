import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Timer {
  hours: number;
  minutes: number;
  seconds: number;
}

interface Titles {
  mainTitle: string;
  subTitle: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timer: Timer, titles: Titles) => void;
  initialTimer: Timer;
  initialTitles: Titles;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  initialTimer,
  initialTitles,
}: SettingsModalProps) {
  const [timer, setTimer] = useState<Timer>(initialTimer);
  const [titles, setTitles] = useState<Titles>(initialTitles);
  const [activeInput, setActiveInput] = useState<'hours' | 'minutes' | 'seconds'>('seconds');

  const handleNumberClick = (num: number) => {
    setTimer(prev => {
      const newValue = prev[activeInput] * 10 + num;
      const maxValue = activeInput === 'hours' ? 23 : 59;
      
      if (newValue > maxValue) {
        return { ...prev, [activeInput]: maxValue };
      }
      return { ...prev, [activeInput]: newValue };
    });
  };

  const handleBackspace = () => {
    setTimer(prev => ({
      ...prev,
      [activeInput]: Math.floor(prev[activeInput] / 10)
    }));
  };

  const handleSave = () => {
    if (timer.hours === 0 && timer.minutes === 0 && timer.seconds === 0) {
      alert('请设置有效的时间');
      return;
    }
    onSave(timer, titles);
  };

  const handleInputFocus = (field: 'hours' | 'minutes' | 'seconds') => {
    setActiveInput(field);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-11/12 max-w-md shadow-xl">
        <h2 className="text-gray-900 dark:text-white text-2xl font-bold mb-6">设置倒计时</h2>
        
        {/* Time Display */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {(['hours', 'minutes', 'seconds'] as const).map((field, index) => (
            <div key={field} className="flex flex-col items-center">
              <input
                type="text"
                value={timer[field].toString().padStart(2, '0')}
                readOnly
                onFocus={() => handleInputFocus(field)}
                className={cn(
                  "w-16 text-center text-3xl font-bold rounded p-2 transition-all",
                  activeInput === field 
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                )}
              />
              <span className="text-gray-500 dark:text-gray-300 text-sm mt-1">
                {field === 'hours' ? '小时' : field === 'minutes' ? '分钟' : '秒'}
              </span>
            </div>
          ))}
        </div>

        {/* Title Inputs */}
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">主标题</label>
          <input
            type="text"
            value={titles.mainTitle}
            onChange={(e) => setTitles({...titles, mainTitle: e.target.value})}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="输入主标题"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">副标题</label>
          <input
            type="text"
            value={titles.subTitle}
            onChange={(e) => setTitles({...titles, subTitle: e.target.value})}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="输入副标题"
          />
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg active:scale-95 transition-transform"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="p-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg active:scale-95 transition-transform"
          >
            <i className="fa-solid fa-delete-left"></i>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium active:scale-95 transition-transform"
          >
            开始倒计时
          </button>
        </div>
      </div>
    </div>
  );
}