import { useSyncExternalStore } from 'react';
import { isSoundOn, subscribeSound } from '../lib/sound';

export const useSoundOn = () => useSyncExternalStore(subscribeSound, isSoundOn, () => false);
