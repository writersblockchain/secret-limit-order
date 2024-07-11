import React, { useEffect, useState } from 'react';

function AnimatedText() {
  const [displayText, setDisplayText] = useState('');
  const fullText = '... confidentially';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText((prev) => fullText.substring(0, (prev.length + 1) % (fullText.length + 1)));
      setIndex((prev) => (prev + 1) % (fullText.length + 1));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block w-[40ch]">
      2. Store limit order on Secret Network{displayText}
    </span>
  );
}

export default AnimatedText;
