import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { auth, signInWithGoogle, signOut } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Auth = ({ onUserChange }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (onUserChange) onUserChange(u);
    });

    return () => unsubscribe();
  }, [onUserChange]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error', err);
      alert('Could not sign in: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign-out error', err);
      alert('Could not sign out: ' + err.message);
    }
  };

  if (loading) return <div className="small">Checking authentication...</div>;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {user ? (
        <>
          <div className="small">Signed in as {user.displayName}</div>
          <button className="btn ghost" onClick={handleSignOut}>Sign out</button>
        </>
      ) : (
        <button className="btn" onClick={handleSignIn}>Sign in with Google</button>
      )}
    </div>
  );
};

export default Auth;

Auth.propTypes = {
  onUserChange: PropTypes.func
};
