import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { auth, signInWithGoogle, signOut } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Auth = ({ onUserChange, onProcessing }) => {
  const [loading, setLoading] = useState(true);
  // displayUser is used to keep the previous user briefly so we can animate sign-out
  const [displayUser, setDisplayUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const pendingHideRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      // On auth change, set loading false and update states used for animation
      setLoading(false);
      if (u) {
        // new sign-in: show immediately
        setDisplayUser(u);
        setVisible(true);
      } else {
        // sign-out: keep displayUser visible briefly, then hide
        setVisible(false);
        if (pendingHideRef.current) clearTimeout(pendingHideRef.current);
        pendingHideRef.current = setTimeout(() => { setDisplayUser(null); pendingHideRef.current = null; }, 350);
      }
      if (onUserChange) onUserChange(u);
    });

    return () => unsubscribe();
  }, [onUserChange]);

  const handleSignIn = async () => {
  setIsProcessing(true);
  if (onProcessing) { onProcessing(true); }
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error', err);
      alert('Could not sign in: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (onProcessing) { onProcessing(false); }
    }
  };

  const handleSignOut = async () => {
  // Play a short exit animation, then perform sign-out so the UI visibly transitions out
  setIsProcessing(true);
  if (onProcessing) { onProcessing(true); }
  try {
    // start exit animation
    setVisible(false);
    // wait for CSS transition to finish (match .auth-status transition ~320ms)
    await new Promise(res => setTimeout(res, 360));
    await signOut();
  } catch (err) {
    console.error('Sign-out error', err);
    alert('Could not sign out: ' + err.message);
  } finally {
    setIsProcessing(false);
    if (onProcessing) { onProcessing(false); }
  }
  };

  
  if (loading) return <div className="small">Checking authentication...</div>;

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {displayUser ? (
        <div className={`auth-status ${visible ? 'show' : ''}`}>
          <div className="small" style={{ color: '#000' }}>Signed in as {displayUser.displayName}</div>
          <button className="btn ghost-soft auth-button" onClick={handleSignOut} disabled={isProcessing}>
            {isProcessing ? <span className="spinner" aria-hidden="true" /> : 'Sign out'}
          </button>
        </div>
      ) : (
        <button className="btn auth-button" onClick={handleSignIn} disabled={isProcessing}>
          {isProcessing ? <span className="spinner" aria-hidden="true" /> : 'Sign in with Google'}
        </button>
      )}
    </div>
  );
};

export default Auth;

Auth.propTypes = {
  onUserChange: PropTypes.func,
  onProcessing: PropTypes.func
};
