
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-stone-800">
        Kronikář profesí
      </h1>
      <p className="mt-2 text-lg text-stone-600">
        Vaše moderní povolání v zrcadle roku 1750
      </p>
    </header>
  );
};
