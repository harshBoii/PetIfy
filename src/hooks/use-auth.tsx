'use client'

// import React, { createContext, useState, useContext, useMemo } from 'react';

// // 1. Create the Auth Context
// const AuthContext = createContext(null);

// // 2. Create the AuthProvider Component
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   /**
//    * Logs in the user by calling the /api/login endpoint.
//    * @param {string} email - The user's email.
//    * @param {string} password - The user's password.
//    */
//   const login = async (email, password) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Throw an error with the message from the API
//         throw new Error(data.message || 'Failed to log in');
//       }

//       // On successful login, set the user state
//       setUser(data.user);
//       console.log('user is')
//       console.log(user)
//       return data.user;

//     } catch (err) {
//       setError(err.message);
//       // Ensure user state is cleared on failed login
//       setUser(null);
//       console.error("Login failed:", err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Logs out the user.
//    */
//   const logout = () => {
//     // In a real app, you'd also invalidate a session/token on the server
//     setUser(null);
//     setError(null);
//   };

//   // The value provided to the context consumers.
//   // useMemo is used for performance optimization.
//   const value = useMemo(() => ({
//       user,
//       profile: user, // The user object contains all profile data
//       isLoading,
//       isAdmin: user?.is_admin || false,
//       error,
//       login,
//       logout,
//     }), [user, isLoading, error]);

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // 3. Create the custom useAuth hook
// /**
//  * Custom hook to access auth state and functions.
//  * @returns {{
//  * user: object | null,
//  * profile: object | null,
//  * isLoading: boolean,
//  * isAdmin: boolean,
//  * error: string | null,
//  * login: (email, password) => Promise<void>,
//  * logout: () => void
//  * }}
//  */
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// context/AuthContext.js

import React, { createContext, useState, useContext, useMemo } from 'react';

// 1. Create the Auth Context
const AuthContext = createContext(null);

// 2. Create the AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Logs in the user by calling the /api/login endpoint.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Corrected API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error with the message from the API
        throw new Error(data.message || 'Failed to log in');
      }

      // On successful login, set the full user state
      setUser(data.user);
      return data.user;

    } catch (err) {
      setError(err.message);
      // Ensure user state is cleared on failed login
      setUser(null);
      console.error("Login failed:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out the user.
   */
  const logout = () => {
    // In a real app, you'd also invalidate a session/token on the server
    setUser(null);
    setError(null);
  };

  // The value provided to the context consumers.
  // useMemo is used for performance optimization.
  const value = useMemo(() => {
    // Create a separate, simplified profile object if the user exists
    const profile = user ? {
        displayName: user.name,
        email: user.email
    } : null;
    
    return {
      user, // The complete user object from the API
      profile, // The simplified profile object with just name and email
      isLoading,
      isAdmin: user?.is_admin || false,
      error,
      login,
      logout,
    }
  }, [user, isLoading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create the custom useAuth hook
/**
 * Custom hook to access auth state and functions.
 * @returns {{
 * user: object | null,
 * profile: { name: string, email: string } | null,
 * isLoading: boolean,
 * isAdmin: boolean,
 * error: string | null,
 * login: (email, password) => Promise<object | undefined>,
 * logout: () => void
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

