import { useEffect, useState } from 'react';
import { fetchFeatureSettingsApi, FeatureSettings } from '../services/api/featureSettingsApi';

export default function useFeatureSettings() {
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchFeatureSettingsApi()
      .then((settings) => { if (active) setFeatureSettings(settings); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load service availability.');
      });
    return () => { active = false; };
  }, []);

  return { featureSettings, error, loading: !featureSettings && !error };
}
