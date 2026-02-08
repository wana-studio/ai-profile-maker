import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'social.selfio.app',
    appName: 'Selfio',
    webDir: 'public',
    server: {
        url: 'https://selfio.social',
        cleartext: true
    },
    plugins: {
        SafeArea: {
            statusBarStyle: "DARK",
            navigationBarStyle: "DARK",
            detectViewportFitCoverChanges: undefined,
            initialViewportFitCover: undefined,
            offsetForKeyboardInsetBug: undefined,
        }
    }
};

export default config;
