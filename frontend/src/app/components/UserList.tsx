"use client";

import React from "react";
import { useGetAllUsersQuery } from "../redux/services/userApi";

export function UsersList() {
  const { data: users, error, isLoading } = useGetAllUsersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.userId}>
          {user.firstName} {user.lastName} ({user.email})
        </li>
      ))}
    </ul>
  );
}
