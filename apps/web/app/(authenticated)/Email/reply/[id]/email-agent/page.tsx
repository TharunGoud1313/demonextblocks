import EmailAgent from "@/components/Email/pages/EmailAgent";

const Page = ({ params }: { params: { id: string } }) => {
  return (
    <div className="max-w-[800px] mx-auto p-4 w-full">
      <EmailAgent id={params.id} />
    </div>
  );
};

export default Page;
