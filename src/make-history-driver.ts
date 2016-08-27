import { DriverFunction, StreamAdapter } from '@cycle/base';
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

const makeHistoryDriver = (): DriverFunction => {
  const history: History = newHistory();
  return (sink$: any, adapter: StreamAdapter): any => {
    const { stream, observer } = adapter.makeSubject<HistoryEvent>();
    const source$ = adapter.remember(stream.startWith(newEvent(void 0)));
    const unlisten = listen((event) => observer.next(newEvent(event.state)));
    adapter.streamSubscribe(sink$, {
      next: (command: HistoryCommand) => {
        if (command.type === 'back') {
          history.back();
        } else if (command.type === 'forward') {
          history.forward();
        } else if (command.type === 'go') {
          history.go(command.delta);
        } else if (command.type === 'push-state') {
          history.pushState(command.data, command.title, command.url);
        } else if (command.type === 'replace-state') {
          history.replaceState(command.data, command.title, command.url);
        } else {
          throw new Error('Invalid HistoryCommand');
        }
      },
      error: (error) => void console.error(error),
      complete: () => {
        unlisten();
        observer.complete();
      }
    });
    return source$;
  };
};

export { makeHistoryDriver };
