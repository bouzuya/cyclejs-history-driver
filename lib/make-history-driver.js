"use strict";

var globals_1 = require('./globals');
var listen = function listen(listener) {
    var type = 'popstate';
    globals_1.window.addEventListener(type, listener);
    return function () {
        return void globals_1.window.removeEventListener(type, listener);
    };
};
var newEvent = function newEvent(data) {
    var title = globals_1.window.document.title;
    var url = globals_1.window.location.href;
    return { data: data, title: title, url: url };
};
var newHistory = function newHistory() {
    return globals_1.window.history;
};
var makeHistoryDriver = function makeHistoryDriver() {
    var history = newHistory();
    return function (sink$, adapter) {
        var _adapter$makeSubject = adapter.makeSubject();

        var stream = _adapter$makeSubject.stream;
        var observer = _adapter$makeSubject.observer;

        var source$ = adapter.remember(stream.startWith(newEvent(void 0)));
        var unlisten = listen(function (event) {
            return observer.next(newEvent(event.state));
        });
        adapter.streamSubscribe(sink$, {
            next: function next(command) {
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
            error: function error(_error) {
                return void console.error(_error);
            },
            complete: function complete() {
                unlisten();
                observer.complete();
            }
        });
        return source$;
    };
};
exports.makeHistoryDriver = makeHistoryDriver;
//# sourceMappingURL=make-history-driver.js.map