'use client';

import React from 'react';
import HeaderV2 from './HeaderV2';
import FooterV2 from './FooterV2';
import ParticleNetworkBackground from './ParticleNetworkBackground';
import HashScrollManager from '@/components/common/HashScrollManager';
import '@/components/v2/styles/globals-v2.css';

interface LayoutV2Props {
    children: React.ReactNode;
}

export default function LayoutV2({ children }: LayoutV2Props) {
    return (
        <div className="v2-layout">
            <ParticleNetworkBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
                <HashScrollManager />
                <HeaderV2 />
                <main className="flex-grow">{children}</main>
                <FooterV2 />
            </div>
        </div>
    );
}
