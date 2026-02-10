import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'social.selfio.app',
    appName: 'Selfio',
    webDir: 'public',
    server: {
        url: 'https://selfio.social',
        cleartext: true,
        allowNavigation: [
            'clerk.selfio.social',
            'accounts.selfio.social',
            '*.clerk.accounts.dev',
            'accounts.clerk.dev',
        ],
    },
    plugins: {
        SafeArea: {
            statusBarStyle: undefined,
            navigationBarStyle: undefined,
            detectViewportFitCoverChanges: undefined,
            initialViewportFitCover: undefined,
            offsetForKeyboardInsetBug: undefined,
        },
        StatusBar: {
            style: "LIGHT",
        }
    }
};

export default config;
