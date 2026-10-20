export type OnboardingMessage = {
  type: string;
  step?: number;
  productNames?: string[];
  top?: number;
  bottom?: number;
};

export function createOnboardingScope(
  root: ShadowRoot,
  surface: HTMLElement,
  onMessage: (message: OnboardingMessage) => void,
) {
  const listeners = new Set<
    (event: { source: unknown; data: OnboardingMessage }) => void
  >();
  const timeouts = new Set<number>();
  const intervals = new Set<number>();
  const frames = new Set<number>();
  const audioContexts = new Set<AudioContext>();
  const abort = new AbortController();
  const parent = { postMessage: onMessage };
  const scopedWindow = {
    parent,
    _sh: undefined as number | undefined,
    google: undefined,
    matchMedia: window.matchMedia.bind(window),
    AudioContext: function () {
      const context = new AudioContext();
      audioContexts.add(context);
      return context;
    },
    addEventListener: (
      _type: string,
      listener: (event: { source: unknown; data: OnboardingMessage }) => void,
    ) => listeners.add(listener),
    scrollTo: (options: ScrollToOptions) => surface.scrollTo(options),
  };
  const scopedDocument = {
    documentElement: surface,
    head: root,
    getElementById: (id: string) => root.getElementById(id),
    querySelector: (selector: string) => root.querySelector(selector),
    querySelectorAll: (selector: string) => root.querySelectorAll(selector),
    createElement: document.createElement.bind(document),
    addEventListener: (
      type: string,
      listener: EventListener,
      options: AddEventListenerOptions,
    ) =>
      surface.addEventListener(type, listener, {
        ...options,
        signal: abort.signal,
      }),
  };
  return {
    document: scopedDocument,
    window: scopedWindow,
    setTimeout: (callback: TimerHandler, delay?: number) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        if (typeof callback === 'function') callback();
      }, delay);
      timeouts.add(id);
      return id;
    },
    clearTimeout: (id?: number) => {
      window.clearTimeout(id);
      if (id !== undefined) timeouts.delete(id);
    },
    setInterval: (callback: TimerHandler, delay?: number) => {
      const id = window.setInterval(callback, delay);
      intervals.add(id);
      return id;
    },
    clearInterval: (id?: number) => {
      window.clearInterval(id);
      if (id !== undefined) intervals.delete(id);
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = window.requestAnimationFrame((time) => {
        frames.delete(id);
        callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      window.cancelAnimationFrame(id);
      frames.delete(id);
    },
    send: (data: OnboardingMessage) =>
      listeners.forEach((listener) => listener({ source: parent, data })),
    dispose: () => {
      abort.abort();
      listeners.clear();
      timeouts.forEach(window.clearTimeout);
      intervals.forEach(window.clearInterval);
      frames.forEach(window.cancelAnimationFrame);
      root.getAnimations().forEach((animation) => animation.cancel());
      audioContexts.forEach((context) => {
        void context.close();
      });
    },
  };
}

export type OnboardingScope = ReturnType<typeof createOnboardingScope>;
