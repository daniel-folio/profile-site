'use client';

import React from 'react';

export function VersionSwitcher({ currentVersion }: { currentVersion: string }) {
    const toggleVersion = () => {
        const next = currentVersion === 'v2' ? 'v1' : 'v2';
        document.cookie = `portfolio-version=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        window.location.reload();
    };

    return (
        <button
            onClick={toggleVersion}
            className="fixed bottom-4 right-4 z-[999] px-3 py-1.5 text-xs font-mono rounded-full border opacity-40 hover:opacity-100 transition-opacity"
            style={{
                borderColor: 'var(--v2-line-up, #ccc)',
                color: 'var(--v2-t-sub, #888)',
                background: 'var(--v2-bg-card, #fff)',
            }}
            title={`현재 ${currentVersion} — 클릭하여 전환`}
        >
            {currentVersion.toUpperCase()}
        </button>
    );
}
