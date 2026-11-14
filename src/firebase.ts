import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Standard Google Login provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Google Workspace provider with Drive & Gmail scopes
const workspaceProvider = new GoogleAuthProvider();
workspaceProvider.setCustomParameters({
  prompt: 'consent select_account',
});
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
];
WORKSPACE_SCOPES.forEach((scope) => workspaceProvider.addScope(scope));

// In-memory OAuth access token cache (never stored in localStorage/sessionStorage)
let isSigningIn = false;
let cachedWorkspaceAccessToken: string | null = null;

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      if (cachedWorkspaceAccessToken) {
        onAuthSuccess?.(user, cachedWorkspaceAccessToken);
      } else if (!isSigningIn) {
        onAuthFailure?.();
      }
    } else {
      cachedWorkspaceAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const getWorkspaceAccessToken = (): string | null => {
  return cachedWorkspaceAccessToken;
};

export const getFirebaseIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
};

// Validate connection to Firestore cleanly on startup
async function testConnection() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      // Expected when test/connection has no public rule: confirms live Firestore connectivity
      return;
    }
    if (msg.includes('the client is offline')) {
      console.warn('Firestore connection check skipped while client appears offline.');
    }
  }
}
testConnection();

export interface VerifiedGoogleAccount {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  idToken: string;
  accessToken?: string;
}

/**
 * Opens the real Google Account chooser popup via Firebase Authentication
 * and verifies the selected Google Account.
 */
export async function signInWithRealGooglePopup(): Promise<VerifiedGoogleAccount> {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedWorkspaceAccessToken = credential.accessToken;
    }

    const verified: VerifiedGoogleAccount = {
      uid: fbUser.uid,
      email: fbUser.email || `${fbUser.uid}@gmail.com`,
      name:
        fbUser.displayName ||
        (fbUser.email ? fbUser.email.split('@')[0] : 'Google Foydalanuvchi'),
      photoURL: fbUser.photoURL || '',
      idToken,
      accessToken: credential?.accessToken,
    };

    try {
      await setDoc(
        doc(db, 'users_public', fbUser.uid),
        {
          uid: fbUser.uid,
          displayName: verified.name.slice(0, 120),
          photoURL: verified.photoURL.slice(0, 1024),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {}

    return verified;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Authenticates with Google Workspace scopes (Google Drive & Gmail)
 * and caches the OAuth access token in memory.
 */
export async function connectGoogleWorkspacePopup(): Promise<{
  user: FirebaseUser;
  accessToken: string;
  idToken: string;
}> {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, workspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Workspace ruxsat tokeni olinmadi. Qayta urinib ko‘ring.');
    }
    cachedWorkspaceAccessToken = credential.accessToken;
    const idToken = await result.user.getIdToken();
    return {
      user: result.user,
      accessToken: credential.accessToken,
      idToken,
    };
  } finally {
    isSigningIn = false;
  }
}

export async function signOutGoogleAccount(): Promise<void> {
  cachedWorkspaceAccessToken = null;
  try {
    await firebaseSignOut(auth);
  } catch {}
}
