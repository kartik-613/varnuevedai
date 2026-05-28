import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { organizationsReducer } from "@/features/organizations/store/organizationsSlice";
import { usersReducer } from "@/features/users/store/usersSlice";
import { resourcesReducer } from "@/features/resources/store/resourcesSlice";

const rootReducer = combineReducers({
  organizations: organizationsReducer,
  users: usersReducer,
  resources: resourcesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks to enforce type-safety when using dispatch and selectors
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
