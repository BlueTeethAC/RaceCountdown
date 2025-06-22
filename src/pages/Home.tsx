import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import SettingsModal from '@/components/SettingsModal';
import type { Timeout } from 'node';


interface Timer {
  hours: number;
  minutes: number;
  seconds: number;
}

interface Titles {
  mainTitle: string;
  subTitle: string;
}

export default function Home() {
  const [timer, setTimer] = useState<Timer>({ hours: 0, minutes: 0, seconds: 0 });
  const [initialTimer, setInitialTimer] = useState<Timer>({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [titles, setTitles] = useState<Titles>({
    mainTitle: '默认标题',
    subTitle: '默认子标题'
  });
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    let interval: Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => {
          let { hours, minutes, seconds } = prev;
          
          if (seconds > 0) {
            seconds--;
          } else if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else if (hours > 0) {
            hours--;
            minutes = 59;
            seconds = 59;
          } else {
            setIsRunning(false);
            setTimeUp(true);
            clearInterval(interval);
            return { hours: 0, minutes: 0, seconds: 0 };
          }
          
          return { hours, minutes, seconds };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimer(initialTimer);
    setTimeUp(false);
  };

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const handleSaveSettings = (newTimer: Timer, newTitles: Titles) => {
    setInitialTimer(newTimer);
    setTimer(newTimer);
    setTitles(newTitles);
    setIsRunning(false);
    setTimeUp(false);
    setShowSettings(false);
  };

  return (
    <div className="relative h-screen w-full bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Main Title */}
      <h1 className="text-white text-[clamp(2rem,6vw,4rem)] font-bold mb-2">{titles.mainTitle}</h1>
      
      {/* Sub Title */}
      <h2 className="text-white text-[clamp(1.5rem,4vw,3rem)] font-bold mb-2">{titles.subTitle}</h2>
      
      {/* Countdown Display */}
      <div className="flex items-center justify-center h-[60%] w-full">
        {timeUp ? (
          <div className="text-white text-[clamp(4rem,12vw,8rem)] font-bold">时间到!</div>
        ) : (
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center">
              <div className="text-blue-500 text-[clamp(4rem,18vw,10rem)] font-bold transform perspective-1000 rotate-x-20">
                {formatTime(timer.hours)}
              </div>
            </div>
            <div className="text-white text-[clamp(4rem,18vw,10rem)] font-bold self-center">:</div>
            <div className="flex flex-col items-center">
              <div className="text-blue-500 text-[clamp(4rem,18vw,10rem)] font-bold transform perspective-1000 rotate-x-20">
                {formatTime(timer.minutes)}
              </div>
            </div>
            <div className="text-white text-[clamp(4rem,18vw,10rem)] font-bold self-center">:</div>
            <div className="flex flex-col items-center">
              <div className="text-blue-500 text-[clamp(4rem,18vw,10rem)] font-bold transform perspective-1000 rotate-x-20">
                {formatTime(timer.seconds)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={toggleTimer}
          className={cn(
            "px-6 py-3 rounded-lg text-white font-bold",
            isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          )}
        >
          {isRunning ? '暂停' : '开始'}
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
        >
          重置
        </button>
      </div>

       {/* Settings Button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => {
            // 保留空函数以防其他地方调用
          }}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white"
          title="全屏"
        >
          <i className="fa-solid fa-maximize"></i>
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
          title="设置"
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        initialTimer={initialTimer}
        initialTitles={titles}
      />
    </div>
  );
}