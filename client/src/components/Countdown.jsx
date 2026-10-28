import { useEffect, useState } from "react";

export default function Countdown({ closesAt }) {
  const getTimeLeft = () => {
    const difference = new Date(closesAt).getTime() - Date.now();
    return Math.max(0, difference);
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [closesAt]);

  if (timeLeft <= 0) {
    return <strong style={{ color: "red" }}>Auction ended</strong>;
  }

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <strong>
      {days > 0 && `${days}d `}
      {hours}h {minutes}m {seconds}s remaining
    </strong>
  );
}
