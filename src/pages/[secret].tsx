// pages/[secret].js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authenticator } from 'otplib';
import styles from './otp.module.css';

const Otp = () => {
  const router = useRouter();
  const { secret } = router.query; // Get the secret from the dynamic route parameter

  const [token, setToken] = useState('');
  const [remainingTime, setRemainingTime] = useState(authenticator.timeRemaining());

  const generateToken = () => {
    try {
      authenticator.options = { digits: 8 };

      const generatedToken = authenticator.generate(secret as string);
      const isValid = authenticator.check(generatedToken, secret as string);

      if (isValid) {
        setToken(generatedToken);
        const newRemainingTime = authenticator.timeRemaining();
        if (newRemainingTime <= 30) {
          // If remaining time is 30 seconds or less, update the token and reset the timer
          setRemainingTime(newRemainingTime);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (secret) {
      generateToken();

      const tokenIntervalId = setInterval(generateToken, 30000);
      const timeIntervalId = setInterval(() => {
        setRemainingTime(authenticator.timeRemaining());
      }, 1000);

      return () => {
        clearInterval(tokenIntervalId);
        clearInterval(timeIntervalId);
      };
    }
  }, [secret, remainingTime]);

  return (
    <div className={styles.centeredContainer}>
      {secret ? (
        <>
          <div>Battle.net Current Authenticator Code:</div>
          <div id={styles.token}>{token}</div>
          
          <div>Remaining Time: {remainingTime} seconds</div>
        </>
      ) : (
        <div>Invalid secret</div>
      )}
    </div>
  );
};

export default Otp;
