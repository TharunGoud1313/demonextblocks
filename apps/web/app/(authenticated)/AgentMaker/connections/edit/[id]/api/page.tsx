"use client";

import { notFound } from "next/navigation";
import ApiConnections from "@/components/AgentMaker/Connections/ApiConnections";
import { NEXT_PUBLIC_API_KEY, ADD_CONNECTIONS } from "@/constants/envConfig";
import { useEffect, useState } from "react";

interface PageProps {
  params: {
    id: string;
  };
}

interface ConnectionData {
  id: string;
  api_connection_json: any;
  [key: string]: any;
}

const EditApiPage = ({ params }: PageProps) => {
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConnection = async () => {
      try {
        const response = await fetch(`${ADD_CONNECTIONS}?id=eq.${params.id}`, {
          headers: {
            Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch connection");
        }

        const data = await response.json();
        if (!data || data.length === 0) {
          setConnection(null);
        } else {
          setConnection(data[0]);
        }
      } catch (error) {
        console.error("Error fetching connection:", error);
        setConnection(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnection();
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!connection) {
    notFound();
  }

  const connectionData =
    typeof connection.api_connection_json === "string"
      ? JSON.parse(connection.api_connection_json)
      : connection.api_connection_json;

  if (!connectionData) {
    notFound();
  }

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit API Connection</h1>
      <ApiConnections
        isEditing={true}
        initialData={{
          ...connection,
          ...connectionData,
          connection_type: "api",
        }}
      />
    </div>
  );
};

export default EditApiPage;
