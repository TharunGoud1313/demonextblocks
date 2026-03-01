"use client";
import React, { useEffect, useState } from "react";
import { GET_CONTACTS_API } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import NewChatContact from "@/components/Email/TabPages/Contacts/NewChatContact";

const EditContacts = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [contactData, setContactData] = useState([]);

  useEffect(() => {
    const fetchContactData = async () => {
      const response = await fetch(
        `${GET_CONTACTS_API}?user_catalog_id=eq.${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );
      if (!response.ok) {
        toast({
          description: "Failed to fetch contact data",
          variant: "destructive",
        });
      }
      const data = await response.json();
      setContactData(data[0]);
    };
    fetchContactData();
  }, [id]);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewChatContact data={contactData} isEdit={true} isView={false} />
    </div>
  );
};

export default EditContacts;
