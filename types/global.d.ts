export {};

declare global {
  interface Window {
    electron: {
      getSources: () => Promise<Array<{
        id: string;
        name: string;
        thumbnail: string;
      }>>;
      setSource: (sourceId: string) => Promise<void>;
      quitApp: () => void;
    };
  }
}
