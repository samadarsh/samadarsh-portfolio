import { useSyncExternalStore } from 'react';
import { getTheme, subscribeTheme } from '../lib/theme';

export const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme, () => 'dark' as const);
