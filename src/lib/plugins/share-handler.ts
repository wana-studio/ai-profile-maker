import { registerPlugin } from "@capacitor/core";

export interface ShareHandlerPlugin {
    canShare(): Promise<{ value: boolean }>;
    share(options: { title?: string; url: string }): Promise<void>;
}

const ShareHandler = registerPlugin<ShareHandlerPlugin>("ShareHandler");

export { ShareHandler };
