import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { darkTheme, lightTheme } from '@constants/ThemeColours';
import { RootState } from '../store';

export type ThemeMode = 'light' | 'dark';
export type Theme = typeof darkTheme | typeof lightTheme;

export { darkTheme, lightTheme };

// Define the state structure
interface ThemeState {
  mode: ThemeMode;
  isSystemPreference: boolean;
  currentTheme: Theme;
}

// Initialize the theme state
const initialState: ThemeState = {
  mode: 'light',
  isSystemPreference: true,
  currentTheme: lightTheme,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
      // Set theme mode manually
      setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
          state.mode = action.payload;
          state.currentTheme = action.payload === 'light' ? lightTheme : darkTheme;
          state.isSystemPreference = false;
      },
      // Toggle between light and dark mode
      toggleTheme: (state) => {
          state.mode = state.mode === 'light' ? 'dark' : 'light';
          state.currentTheme = state.mode === 'light' ? lightTheme : darkTheme;
          state.isSystemPreference = false;
      },
      // Use system preference for theme
      useSystemTheme: (state, action: PayloadAction<ThemeMode>) => {
          state.mode = action.payload;
          state.currentTheme = action.payload === 'light' ? lightTheme : darkTheme;
          state.isSystemPreference = true;
      },
  },
});

export const { setThemeMode, toggleTheme, useSystemTheme } = themeSlice.actions;


export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectIsSystemPreference = (state: RootState) => state.theme.isSystemPreference;
export const selectCurrentTheme = (state: RootState) => state.theme.currentTheme;

// Export reducer
export default themeSlice.reducer;