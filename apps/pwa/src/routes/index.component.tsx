import { rpc } from "~/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const component = function Index() {
  const query = useQuery({
    queryKey: ["hello"],
    queryFn: async () => {
      console.log("hello");
      const res = await rpc.api.name.$get({ query: { name: "Kevin " } });
      const json = await res.json();
      console.log({ json });
      return json;
    },
  });

  console.log({ error: query.error });

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <p>{query.data?.message}</p>
    </div>
  );
};
