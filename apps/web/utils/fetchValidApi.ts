import { ADD_CONNECTIONS, NEXT_PUBLIC_API_KEY } from "@/constants/envConfig";

export const fetchValidApi = async () => {
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await fetch(ADD_CONNECTIONS, requestOptions);

    const result = await response.json();
    // const validApis = result.filter(
    //   (item: any) => item?.test_status === "passed"
    // );
    // return validApis;
    return result;
  } catch (error) {
    return [];
  }
};
