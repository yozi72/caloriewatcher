
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9c145b3b757047539f2f1bc062676b7d',
  appName: 'caloriewatcher',
  webDir: 'dist',
  server: {
    url: 'https://9c145b3b-7570-4753-9f2f-1bc062676b7d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
