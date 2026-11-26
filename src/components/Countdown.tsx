import { useState, useEffect } from 'react';

export default function Countdown() {
  const targetDate = new Date('2027-09-11T15:30:00').getTime();

  const calculateTimeLeft = () => {
    const distance = targetDate - Date.now();
    if (distance <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-6">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
      ].map((item) => (
        <div
          key={item.label}
          className="text-center py-3 sm:py-4 px-2 bg-cream border border-ink/15"
        >
          <div className="text-2xl sm:text-4xl font-serif text-ink tabular-nums tracking-tight">
            {item.value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs font-sans font-semibold uppercase tracking-wider text-ink/65 mt-1">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
