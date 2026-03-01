import DocumentPreview from "@/components/Email/pages/DocumentPreview";

const page = ({ params }: { params: { id: string; url: string } }) => {
  const { id, url } = params;

  return (
    <div className=" h-full max-w-[800px] mx-auto p-4 w-full">
      <DocumentPreview id={id} url={url} />
    </div>
  );
};

export default page;
