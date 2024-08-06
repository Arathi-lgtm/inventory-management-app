import React from 'react';
import { Button } from '@mui/material';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/firebase';

const Login = () => {
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Button variant="contained" onClick={signInWithGoogle}>
      SIGN IN WITH GOOGLE
    </Button>
  );
};

export default Login;
