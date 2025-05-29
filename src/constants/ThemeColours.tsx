export interface AppTheme {
  dark: boolean
  colors: {
    primary: string
    secondary?: string
    tertiary?: string
    background: string
    text?: string
    card?: string
    border?: string
  }
  font: string 
}

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    primary: '#007AFF', 
    secondary: '#03DAC6',
    tertiary: '#BB86FC',
    background: '#121212',
    text: '#FFFFFF',
    card: '#1E1E1E',
    border: '#272727'
  },
  font: 'Roboto'
}

export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    secondary: '#6200EE',
    tertiary: '#03DAC6',
    background: '#F5F5F5',
    text: '#000000',
    card: '#FFFFFF',
    border: '#E0E0E0'
  },
  font: 'Roboto' 
}