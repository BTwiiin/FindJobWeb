"use client"

import React, { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useJobPostStore } from "../hooks/useJobPostStore";
import { JobPost } from "@/types";
import toast from "react-hot-toast";

type props = {
    children: React.ReactNode
}

export default function SignalRProvider({ children }: props) {
    const connection = useRef<HubConnection | null>(null);
    const addJobPost = useJobPostStore((state) => state.addJobPost);

    useEffect(() => {
        if (!connection.current) {
            connection.current = new HubConnectionBuilder()
                .withUrl("http://localhost:6001/notifications")
                .withAutomaticReconnect().build();
            
            connection.current.start()
                .then(() => 'Connection to notifications started')
                .catch(err => console.error('Error while starting connection: ', err));
        }

        connection.current.on("ReceiveJobPost", (jobPost: JobPost) => {
            addJobPost(jobPost);

            toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? "transition-all opacity-100 transform translate-y-0"
                              : "transition-all opacity-0 transform translate-y-8"
                  } flex items-center justify-between p-4 bg-gray-500 text-white rounded-lg shadow-lg`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">New job posts were added!</span>
                    <strong>Sort by Recently Posted to view them</strong>
                  </div>
                </div>
              ));
        });

        return () => {
            connection.current?.off("ReceiveJobPost");
        }
    }, [addJobPost]);

    return (
        children
    )
}
