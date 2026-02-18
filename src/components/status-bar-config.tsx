'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function StatusBarConfig() {
    useEffect(() => {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) return;

        const configureStatusBar = async () => {
            try {
                // Set style to Dark (which means light text/icons for dark backgrounds)
                await StatusBar.setStyle({ style: Style.Dark });

                // Make the status bar transparent and overlay the webview
                if (Capacitor.getPlatform() === 'android') {
                    await StatusBar.setOverlaysWebView({ overlay: true });
                    await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
                }
            } catch (error) {
                console.error('Failed to configure status bar:', error);
            }
        };

        configureStatusBar();
    }, []);

    return null;
}
