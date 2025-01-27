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

            connection.current.on("ReceiveJobPost", (jobPost: JobPost) => {
                addJobPost(jobPost);

                toast.success(`New job post added: ${jobPost.title}`, {
                    position: "top-center",
                });
            });

        }
    }, [addJobPost]);

    return (
        children
    )
}
