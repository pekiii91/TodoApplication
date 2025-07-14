import React, { useEffect, useState } from "react";

interface Quote {
  text: string;
  author: string;
}

const RandomQuotes: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetch("/quotes.json")
      .then((res) => res.json())
      .then((data: Quote[]) => {
        const random = data[Math.floor(Math.random() * data.length)];
        setQuote(random);
      })
      .catch((error) => console.error("Greska pri dohvatanju citata", error));
  }, []);

  if (!quote) return null;

  return (
    <div style={{ marginBottom: "1.5rem", fontStyle: "italic", color: "#444" }}>
      <p>"{quote.text}"</p>
      <p style={{ textAlign: "right", fontWeight: "bold" }}>- {quote.author}</p>
    </div>
  );
};

export default RandomQuotes;
