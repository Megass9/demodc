export {};

declare global {
  interface Window {
    electron: {
      getSources: () => Promise<Array<{
        id: string;
        name: string;
        thumbnail: string;
      }>>;
      setSource: (sourceId: string, shareAudio: boolean) => Promise<void>;
      quitApp: () => void;
    };
  }
}
