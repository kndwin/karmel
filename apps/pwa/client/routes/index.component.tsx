import { rpc } from "~/client/lib/rpc";
import { Button } from "~/client/ui/button";

export const component = function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <a href={rpc.api.auth.login.github.$url().toString()}>
        Sign in with Github (RPC)
      </a>
      <a href={rpc.api.auth.logout.$url().toString()}>Sign out</a>
    </div>
  );
};
