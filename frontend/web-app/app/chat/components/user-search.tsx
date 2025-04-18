"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  username: string;
}

interface UserSearchProps {
  onSelectUser: (userId: string) => void;
  currentUserId: string;
}

export function UserSearch({ onSelectUser, currentUserId }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  return (
    <div className="space-y-4">
      <div>
        <Input
          type="search"
          placeholder="Поиск пользователей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Поиск...</p>}
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 border rounded-md hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{user.username}</span>
              </div>
              <Button
                size="sm"
                onClick={() => onSelectUser(user.id)}
              >
                Написать
              </Button>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && searchQuery.length >= 2 && users.length === 0 && (
        <p className="text-sm text-muted-foreground">Пользователи не найдены</p>
      )}
    </div>
  );
} 