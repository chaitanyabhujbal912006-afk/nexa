declare class Theme {
    #private;
    get current(): "light" | "dark";
    set current(value: 'light' | 'dark');
}
export declare const theme: Theme;
export {};
