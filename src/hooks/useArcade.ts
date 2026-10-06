import { useSyncExternalStore } from 'react';
import { isArcade, subscribeArcade } from '../lib/arcade';

export const useArcade = () => useSyncExternalStore(subscribeArcade, isArcade, () => false);
