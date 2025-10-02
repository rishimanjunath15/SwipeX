import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import interviewReducer from './interviewSlice';
import candidateReducer from './candidateSlice';

/**
 * Redux Persist Configuration
 * Persists interview and candidate state to localStorage
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['interview', 'candidate'], // Only persist these reducers
};

const rootReducer = combineReducers({
  interview: interviewReducer,
  candidate: candidateReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux store with persistence
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for redux-persist
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
