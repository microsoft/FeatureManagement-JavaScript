// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import { createContext, useState } from "react";

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined);


  const loginUser = (user) => {
    setCurrentUser(user);
  };

  const logoutUser = () => {
    setCurrentUser(undefined);
  };

  return (
    <AppContext.Provider value={{ currentUser, loginUser, logoutUser }}>
      {children}
    </AppContext.Provider>
  );
};