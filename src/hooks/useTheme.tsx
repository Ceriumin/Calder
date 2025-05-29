import { useDispatch, useAppSelector } from './_index';
import { 
  setThemeMode,
  toggleTheme,
  useSystemTheme,
  selectThemeMode,
  selectIsSystemPreference,
  selectCurrentTheme,
} from '@/store/slices/themeSlice';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const useTheme = () => {

  const dispatch = useDispatch();

  const themeMode = useAppSelector(selectThemeMode);
  const isSystemPreference = useAppSelector(selectIsSystemPreference);
  const currentTheme = useAppSelector(selectCurrentTheme);
  const systemColorScheme = useColorScheme() as 'light' | 'dark';

  // Effect is triggered when the system color scheme changes
  // and the user has set the theme to follow system preference
  // This will update the theme mode in the store
  // to match the system color scheme
  useEffect(() => {
    if (isSystemPreference && systemColorScheme) {
      dispatch(useSystemTheme(systemColorScheme));
    }
  }, [isSystemPreference, systemColorScheme, dispatch]);

  // Functions to set the theme modes
  const setLightTheme = () => dispatch(setThemeMode('light'));
  const setDarkTheme = () => dispatch(setThemeMode('dark'));
  const toggleThemeMode = () => dispatch(toggleTheme());
  const setSystemPreference = () => dispatch(useSystemTheme(systemColorScheme || 'light'));

  return {
    themeMode,
    isSystemPreference,
    currentTheme,
    setLightTheme,
    setDarkTheme,
    toggleThemeMode,
    setSystemPreference,
  };
};