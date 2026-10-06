import { useSyncExternalStore } from 'react';
import { getAudience, subscribeAudience, type Audience } from '../lib/audience';

export const useAudience = () =>
  useSyncExternalStore(subscribeAudience, getAudience, () => 'everyone' as Audience);
