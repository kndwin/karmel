import { rpc } from "~/client/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const component = function Index() {
  const query = useQuery({
    queryKey: ["hello"],
    queryFn: () =>
      rpc.name.$get({ query: { name: "Kevin " } }).then((res) => res.json()),
  });

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <p>{query.data?.message}</p>
    </div>
  );
};
