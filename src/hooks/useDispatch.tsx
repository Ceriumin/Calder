import { useDispatch as useReduxDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';

export const useDispatch = () => useReduxDispatch<AppDispatch>();

// useDispatch is a custom hook that wraps the useDispatch hook from react-redux.
// It is used to dispatch actions to the Redux store.