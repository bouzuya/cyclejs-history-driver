export declare type HistoryCommand = HistoryBackCommand | HistoryForwardCommand | HistoryGoCommand | HistoryPushStateCommand | HistoryReplaceStateCommand;
export interface HistoryBackCommand {
    type: 'back';
}
export interface HistoryForwardCommand {
    type: 'forward';
}
export interface HistoryGoCommand {
    type: 'go';
    delta?: number;
}
export interface HistoryPushStateCommand {
    type: 'push-state';
    data: any;
    title?: string;
    url?: string;
}
export interface HistoryReplaceStateCommand {
    type: 'replace-state';
    data: any;
    title?: string;
    url?: string;
}
