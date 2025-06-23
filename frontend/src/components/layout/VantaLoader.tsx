'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const VantaBackground = dynamic(() => import('@/components/layout/VantaBackground'), {
  ssr: false,
  loading: () => <div className="fixed top-0 left-0 w-full h-full bg-white -z-10" />,
});

const VantaLoader: React.FC = () => {
  return <VantaBackground />;
};

export default VantaLoader; 