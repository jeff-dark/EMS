declare module 'disable-devtool' {
  interface Options {
    md5?: string;
    clearIntervalWhenDevtoolClosed?: boolean;
    ondevtoolopen?: () => void;
  }
  export default function disableDevtool(options?: Options): void;
}

declare module 'nosleep.js' {
  export default class NoSleep {
    constructor();
    enable(): Promise<void> | void;
    disable(): void;
  }
}
