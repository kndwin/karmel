import { useQuery } from "@tanstack/react-query";
import { rpc } from "~/client/lib/rpc";
import { Button } from "~/client/ui/button";

export const component = function Index() {
  const query = useQuery({
    queryKey: ["test"],
    queryFn: () => rpc.api.auth.echo.$get(),
  });

  console.log({ query });

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <Button asChild>
        <a href={"/api/auth/login"}>Sign in with Github</a>
      </Button>
      <Button asChild>
        <a href={rpc.api.auth.login.$url().toString()}>
          Sign in with Github (RPC)
        </a>
      </Button>
    </div>
  );
};
