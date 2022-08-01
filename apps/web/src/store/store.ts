import reducers from "./reducers";
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

export function makeStore(preloadedState: any) {
  return configureStore({
    preloadedState,
    reducer: reducers,
  });
}

export const store = (preloadedState: any) => makeStore(preloadedState);

export type Store = ReturnType<typeof store>;
export type AppState = ReturnType<Store["getState"]>;
export type AppDispatch = Store["dispatch"];

export type AppThunk<ReturnType> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;
