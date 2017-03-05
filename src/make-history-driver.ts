import xs, { Stream } from 'xstream';
import { window } from './globals';
import { HistoryEvent } from './history-event';
import { HistoryCommand } from './history-command';

const listen = (
  listener: (this: Window, event: PopStateEvent) => any
): () => void => {
  const type = 'popstate';
  window.addEventListener(type, listener);
  return () => void window.removeEventListener(type, listener);
};

const newEvent = (data: any): HistoryEvent => {
  const title = window.document.title;
  const url = window.location.href;
  return { data, title, url };
};

const newHistory = (): History => {
  return window.history;
};

const makeHistoryDriver = () => {
  const history: History = newHistory();
  return (sink$: Stream<HistoryCommand>): Stream<HistoryEvent> => {
    const source$ = xs
      .createWithMemory<HistoryEvent>()
      .startWith(newEvent(void 0));
    const unlisten = listen((event) => {
      return source$.shamefullySendNext(newEvent(event.state));
    });
    const subscription = sink$.subscribe({
      next: (command: HistoryCommand) => {
        if (command.type === 'back') {
          history.back();
        } else if (command.type === 'forward') {
          history.forward();
        } else if (command.type === 'go') {
          history.go(command.delta);
        } else if (command.type === 'push-state') {
          const title = typeof command.title === 'undefined'
            ? ''
            : command.title;
          history.pushState(command.data, title, command.url);
        } else if (command.type === 'replace-state') {
          const title = typeof command.title === 'undefined'
            ? ''
            : command.title;
          history.replaceState(command.data, title, command.url);
        } else {
          throw new Error('Invalid HistoryCommand');
        }
      },
      error: (error) => void console.error(error),
      complete: () => {
        unlisten();
        subscription.unsubscribe();
      }
    });
    return source$;
  };
};

export { makeHistoryDriver };
