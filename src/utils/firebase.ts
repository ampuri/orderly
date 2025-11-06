import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAk0jb-jBtMydYmqfDCM2XRkjlrivBzBWY',
  authDomain: 'amporderly.firebaseapp.com',
  projectId: 'amporderly',
  storageBucket: 'amporderly.firebasestorage.app',
  messagingSenderId: '768136778117',
  appId: '1:768136778117:web:3f3befc1ba49da2965f4ec',
  databaseURL: 'https://amporderly-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
