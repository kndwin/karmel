import { createFileRoute } from "@tanstack/react-router";
import { SVGProps } from "react";
import { rpc } from "~/shared/rpc";
import { Button } from "~/shared/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <section className="w-full py-12 md:py-16 xl:py-20">
        <div className="container flex flex-col items-center space-y-4 px-4 text-center md:space-y-8 md:px-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              Karmel
            </h1>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
              Rjjjje games for the modern web
            </p>
          </div>
          <Button size="lg" asChild>
            <a
              className="font-semibold"
              href={rpc.api.auth.login.github.$url().toString()}
            >
              Sign in with Github
              <Icon.Github className="ml-3" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

const Icon = {
  Github: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
};
