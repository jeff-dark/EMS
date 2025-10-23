import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

type ProctorEvent = {
  type: string;
  details?: Record<string, unknown>;
};

interface Options {
  sessionId: number;
  disabled?: boolean; // when true, suppress all handlers and alerts
  enableFullscreen?: boolean;
  blockContextMenu?: boolean;
  blockClipboard?: boolean;
  blockShortcuts?: boolean;
  warnOnViolation?: boolean;
  violationThreshold?: number; // auto-submit when reached (>0)
  enableDisableDevtool?: boolean;
  enableNoSleep?: boolean;
  countingTypes?: string[]; // which event types count toward threshold
}

function postEvent(sessionId: number, payload: ProctorEvent) {
  // Use fetch to POST; CSRF cookie is managed by Laravel Sanctum/session
  return fetch(`/sessions/${sessionId}/proctor-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function useProctoring({
  sessionId,
  disabled = false,
  enableFullscreen = true,
  blockContextMenu = true,
  blockClipboard = true,
  blockShortcuts = true,
  warnOnViolation = true,
  violationThreshold = 0,
  enableDisableDevtool = false,
  enableNoSleep = false,
  countingTypes = [],
}: Options) {
  const violationCount = useRef(0);
  const fsRequested = useRef(false);
  const noSleepRef = useRef<null | { enable: () => Promise<void> | void; disable: () => void }>(null);
  const enabledNoSleep = useRef(false);
  const devtoolDisabled = useRef(false);
  const autoSubmitting = useRef(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const friendlyViolation = (type: string): string => {
    switch (type) {
      case 'exited_fullscreen':
        return 'You exited fullscreen which is required during the exam.';
      case 'tab_hidden':
        return 'You switched tabs or minimized the window during the exam.';
      case 'contextmenu_blocked':
        return 'Right-click/context menu is not allowed during the exam.';
      case 'clipboard_blocked':
        return 'Copy/Cut/Paste actions are not allowed during the exam.';
      case 'shortcut_blocked':
        return 'A restricted keyboard shortcut was used during the exam.';
      case 'devtool_open':
        return 'Developer tools were opened during the exam.';
      case 'window_blur':
        return 'The exam window lost focus.';
      default:
        return 'A proctoring violation was detected.';
    }
  };

  useEffect(() => {
    const maybeAutoSubmit = (reason: string) => {
      if (disabledRef.current) return;
      if (violationThreshold > 0 && violationCount.current >= violationThreshold && !autoSubmitting.current) {
        autoSubmitting.current = true;
        // Inform the student of the final violation and that auto-submission will occur now.
        // eslint-disable-next-line no-alert
        if (!disabledRef.current) alert(
          `${friendlyViolation(reason)}\n\nThe exam has reached the violation limit (${violationCount.current}/${violationThreshold}). It will be submitted now.`
        );
        postEvent(sessionId, { type: 'auto_submit_threshold', details: { reason, violations: violationCount.current } });
        router.post(`/sessions/${sessionId}/submit`);
      }
    };

    const recordViolation = (type: string) => {
      if (disabledRef.current) return;
      if (countingTypes.length === 0 || countingTypes.includes(type)) {
        violationCount.current += 1;
        maybeAutoSubmit(type);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      if (disabledRef.current || !blockContextMenu) return;
      e.preventDefault();
      postEvent(sessionId, { type: 'contextmenu_blocked' });
      recordViolation('contextmenu_blocked');
    };

    const onCopyCutPaste = (e: ClipboardEvent) => {
      if (disabledRef.current || !blockClipboard) return;
      e.preventDefault();
      postEvent(sessionId, { type: 'clipboard_blocked', details: { action: e.type } });
      recordViolation('clipboard_blocked');
    };

    const forbiddenCombos = new Set([
      'Control+Shift+I',
      'Control+Shift+J',
      'Control+Shift+C',
      'Control+U',
      'Control+S',
      'Control+P',
      'F12',
      'PrintScreen',
    ]);

    const onKeyDown = (e: KeyboardEvent) => {
      if (disabledRef.current || !blockShortcuts) return;
      const combo = `${e.ctrlKey ? 'Control+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
      if (forbiddenCombos.has(combo)) {
        e.preventDefault();
        postEvent(sessionId, { type: 'shortcut_blocked', details: { combo } });
        recordViolation('shortcut_blocked');
        if (!disabledRef.current && warnOnViolation) {
          // Light, non-blocking warning
          console.warn('Prohibited shortcut blocked');
        }
      }
    };

    const tryRequestFullscreen = async () => {
      if (!enableFullscreen) return;
      if (document.fullscreenElement) return;
      try {
        fsRequested.current = true;
        await document.documentElement.requestFullscreen();
        postEvent(sessionId, { type: 'entered_fullscreen' });
      } catch {
        // ignore
      }
    };

    const onFullscreenChange = () => {
      if (disabledRef.current) return;
      const isFs = !!document.fullscreenElement;
      if (!isFs) {
        recordViolation('exited_fullscreen');
        postEvent(sessionId, { type: 'exited_fullscreen', details: { violations: violationCount.current } });
        if (!disabledRef.current && warnOnViolation) {
          // eslint-disable-next-line no-alert
          alert('Fullscreen is required for the exam. Please do not exit fullscreen.');
        }
        // Attempt to restore fullscreen
        void tryRequestFullscreen();
      }
    };

    const onVisibility = () => {
      if (disabledRef.current) return;
      if (document.hidden) {
        recordViolation('tab_hidden');
        postEvent(sessionId, { type: 'tab_hidden', details: { violations: violationCount.current } });
        if (!disabledRef.current && warnOnViolation) {
          // eslint-disable-next-line no-alert
          alert('Tab change detected. Please remain on the exam page.');
        }
      }
    };

    const onBlur = () => {
      if (disabledRef.current) return;
      recordViolation('window_blur');
      postEvent(sessionId, { type: 'window_blur', details: { violations: violationCount.current } });
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (disabledRef.current) return;
      // Warn before accidental refresh/close
      e.preventDefault();
      e.returnValue = '';
      postEvent(sessionId, { type: 'before_unload' });
    };

    // Attach listeners
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopyCutPaste);
    document.addEventListener('cut', onCopyCutPaste);
    document.addEventListener('paste', onCopyCutPaste);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    // Optional: prevent device sleep (enable on first interaction if necessary)
    const attachNoSleep = async () => {
      if (!enableNoSleep || enabledNoSleep.current) return;
      try {
        const { default: NoSleep } = await import('nosleep.js');
        noSleepRef.current = new NoSleep();
        await noSleepRef.current.enable();
        enabledNoSleep.current = true;
        postEvent(sessionId, { type: 'nosleep_enabled' });
      } catch {
        // Some browsers require a gesture – fallback to first user interaction
        const gestureEnable = async () => {
          try {
            if (!noSleepRef.current) {
              const { default: NoSleep } = await import('nosleep.js');
              noSleepRef.current = new NoSleep();
            }
            await noSleepRef.current!.enable();
            enabledNoSleep.current = true;
            postEvent(sessionId, { type: 'nosleep_enabled_gesture' });
            document.removeEventListener('click', gestureEnable);
            document.removeEventListener('touchstart', gestureEnable);
          } catch {
            // keep listeners, or give up silently
          }
        };
        document.addEventListener('click', gestureEnable, { once: true });
        document.addEventListener('touchstart', gestureEnable, { once: true });
      }
    };

    // Optional: disable devtools in production (deterrence only)
    const attachDisableDevtool = async () => {
      if (!enableDisableDevtool || devtoolDisabled.current) return;
      try {
        const { default: disableDevtool } = await import('disable-devtool');
        disableDevtool({ clearIntervalWhenDevtoolClosed: false, ondevtoolopen: () => {
          if (!disabledRef.current) {
            recordViolation('devtool_open');
            postEvent(sessionId, { type: 'devtool_open', details: { violations: violationCount.current } });
            if (warnOnViolation) alert('Developer tools are not allowed during the exam.');
          }
        }});
        devtoolDisabled.current = true;
        postEvent(sessionId, { type: 'devtool_protection_enabled' });
      } catch {
        // ignore
      }
    };

    // Initial entry into fullscreen after a brief tick so layout mounts
    const fsTimer = setTimeout(() => { void tryRequestFullscreen(); }, 300);
    void attachNoSleep();
    void attachDisableDevtool();

    // Cleanup
    return () => {
      clearTimeout(fsTimer);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopyCutPaste);
      document.removeEventListener('cut', onCopyCutPaste);
      document.removeEventListener('paste', onCopyCutPaste);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      try {
        if (noSleepRef.current && enabledNoSleep.current) noSleepRef.current.disable();
      } catch {
        // ignore
      }
    };
  }, [sessionId, disabled, enableFullscreen, blockContextMenu, blockClipboard, blockShortcuts, warnOnViolation, violationThreshold, enableDisableDevtool, enableNoSleep, countingTypes]);
}
