"use client";

import React, { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useJobPostStore } from "../hooks/useJobPostStore";
import { JobPost } from "@/types";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

type props = {
    children: React.ReactNode;
};

export default function SignalRProvider({ children }: props) {
    const connection = useRef<HubConnection | null>(null);
    const addJobPost = useJobPostStore((state) => state.addJobPost);
    const { data: session, status } = useSession(); // Access session status

    useEffect(() => {
        if (status === "loading") {
            return; // Don't start the connection until session is loaded
        }

        // Cleanup: Disconnect if the session changes or the component is unmounted
        const cleanUpConnection = () => {
            if (connection.current) {
                connection.current.stop().catch((err) => console.error('Error stopping connection:', err));
                connection.current = null; // Reset the connection ref
            }
        };

        // If session is available and user is authenticated
        if (session?.accessToken) {
            if (!connection.current) {
                connection.current = new HubConnectionBuilder()
                    .withUrl(`http://localhost:6001/notifications?access_token=${session?.accessToken || ""}`)
                    .withAutomaticReconnect()
                    .build();

                connection.current
                    .start()
                    .then(() => console.log('Connection to notifications started with token'))
                    .catch((err) => console.error('Error while starting connection: ', err));
            }
        } else {
            // If session is not available or user is not authenticated
            if (!connection.current) {
                connection.current = new HubConnectionBuilder()
                    .withUrl("http://localhost:6001/notifications")
                    .withAutomaticReconnect()
                    .build();

                connection.current
                    .start()
                    .then(() => console.log('Connection to notifications started without token'))
                    .catch((err) => console.error('Error while starting connection: ', err));
            }
        }

        connection.current?.on("ReceiveJobPost", (jobPost: JobPost) => {
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

        connection.current?.on("ReceiveJobPostRequestPlaced", (message: string) => {
            toast.success(message);
        });

        return cleanUpConnection; // Cleanup connection when session changes or component unmounts
    }, [addJobPost, session, status]); // Trigger effect when session or status changes

    return children;
}
