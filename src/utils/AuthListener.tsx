import { useEffect } from 'react';
import { useDispatch, useAppSelector } from '@/hooks/_index';
import { checkAuthState } from '@/store/slices/authSlice';

export function AuthListener() {
  const dispatch = useDispatch();
  const { authChecked, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Check auth status when component mounts, but only if not already checking or checked
    if (!authChecked && !isLoading) {
      dispatch(checkAuthState());
    }
  }, [dispatch, authChecked, isLoading]);

  // This component doesn't render anything
  return null;
}