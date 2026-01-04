import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.hooshang.profilemaker',
    appName: 'Profile Maker',
    webDir: 'public',
    server: {
        url: 'https://hooshang.app',
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
