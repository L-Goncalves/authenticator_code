// pages/[secret].js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authenticator } from 'otplib';
import styles from './otp.module.css';

const Otp = () => {
  const router = useRouter();
  const { secret } = router.query; // Get the secret from the dynamic route parameter
  document.title = `Online Authenticator`;
  const [token, setToken] = useState('');
  const [remainingTime, setRemainingTime] = useState(authenticator.timeRemaining());
  const [showCopiedMessage, setShowCopiedMessage] = useState<Boolean>(false);
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


  const copyToClipboard = () => {
    navigator.clipboard.writeText(token)
    setShowCopiedMessage(true)

    setTimeout(() => {
      setShowCopiedMessage(false)
    }, 2000);
  };

  useEffect(() => {
    if (secret) {
      generateToken();

      const tokenIntervalId = setInterval(generateToken, 30000);
      const timeIntervalId = setInterval(() => {
        setRemainingTime(authenticator.timeRemaining());
       
      }, 500);

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
          <div>Your Current Authenticator Code:</div>
          <div onClick={copyToClipboard} id={styles.token}>{token}</div>
        
          <div>Remaining Time: {remainingTime} seconds</div>

          <div className={showCopiedMessage ? `${styles.copiedMessage} ${styles.show}` : styles.copiedMessage}>
            Code Copied
          </div>
        </>

        
      ) : (
        <div>Invalid secret</div>
      )}
    </div>
  );
};

export default Otp;
