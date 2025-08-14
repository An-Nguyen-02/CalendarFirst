import { createContext } from 'react';
import type { AppState } from './types';

export const AppContext = createContext<AppState | null>(null);
