export interface AppTheme {
  dark: boolean
  colors: {
    primary: string
    secondary?: string
    tertiary?: string
    background: string
    text?: string
  }
  font: string 
}

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    primary: '#6200EE',
    secondary: '#03DAC6',
    tertiary: '#BB86FC',
    background: '#121212',
    text: '#FFFFFF',
  },
  font: 'Roboto'
}

export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    primary: '#ffff',
    secondary: '#6200EE',
    tertiary: '#03DAC6',
    background: '#F5F5F5',
    text: '#000000',
  },
  font: 'Roboto' 
}