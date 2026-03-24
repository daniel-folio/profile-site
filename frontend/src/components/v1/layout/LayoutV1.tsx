'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import ThreeShapesBackground from '../../v2/layout/ThreeShapesBackground';
import HashScrollManager from '@/components/common/HashScrollManager';

interface LayoutV1Props {
    children: React.ReactNode;
}

export default function LayoutV1({ children }: LayoutV1Props) {
    return (
        <>
            <ThreeShapesBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
                <HashScrollManager />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </div>
        </>
    );
}
