import { useEffect } from 'react';
import { useDispatch, useAppSelector } from '@/hooks/_index';
import { checkAuthState } from '@/store/slices/authSlice';

export function AuthListener() {
  const dispatch = useDispatch();
  const { authChecked, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!authChecked && !isLoading) {
      dispatch(checkAuthState());
    }
  }, [dispatch, authChecked, isLoading]);

  // This component doesn't render anything
  return null;
}