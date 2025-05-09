import { useSelector as useReduxSelector, TypedUseSelectorHook} from 'react-redux';
import { RootState } from '../store/store';

// Typed version of useSelector
// This allows us to use the useSelector hook with the correct type for our state
// UseSelector is a hook that allows us to extract data from the Redux store state
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

