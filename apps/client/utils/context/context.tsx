"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type RoleContextType = {
  role: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  id: string;
  setRole: ({
    role,
    firstName,
    lastName,
    avatar,
    email,
    id,
  }: {
    role: string;
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
    id: string;
  }) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({
  children,
  initialRole,
  initialFirstName,
  initialLastName,
  initialAvatar,
  initialEmail,
  initialId,
}: {
  children: ReactNode;
  initialRole: string;
  initialFirstName: string;
  initialLastName: string;
  initialAvatar: string;
  initialEmail: string;
  initialId: string;
}) => {
  const [state, setState] = useState({
    role: initialRole,
    firstName: initialFirstName,
    lastName: initialLastName,
    avatar: initialAvatar,
    email: initialEmail,
    id: initialId,
  });

  const setRole = ({
    role,
    firstName,
    lastName,
    avatar,
    email,
    id,
  }: {
    role: string;
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
    id: string;
  }) => {
    setState({ role, firstName, lastName, avatar, email, id });
  };

  return (
    <RoleContext.Provider
      value={{
        role: state.role,
        firstName: state.firstName,
        lastName: state.lastName,
        avatar: state.avatar,
        email: state.email,
        id: state.id,
        setRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
};

export const useUser = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useUser must be used within a RoleProvider");
  return context;
};
