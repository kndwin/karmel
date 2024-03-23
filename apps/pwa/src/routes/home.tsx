import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { SVGProps } from "react";

import { useSessionQuery, SessionContext } from "/shared/auth/hooks";
import { rpc } from "~/shared/rpc";
import { Avatar, AvatarImage, AvatarFallback } from "~/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "~/shared/ui/dropdown-menu";

export const Route = createFileRoute("/home")({
  component: Layout,
});

function Layout() {
  const sessionQuery = useSessionQuery();

  if (sessionQuery.isPending || sessionQuery.data === undefined) {
    return (
      <div className="p-4 h-screen w-screen flex">
        <div className="flex-1 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={sessionQuery.data}>
      <div className="flex flex-col h-screen">
        <nav className="px-6 py-4 items-center flex">
          <Link to="/home" className="flex items-center space-x-2">
            <ChevronRightIcon className="w-6 h-6" />
            <span className="font-semibold">Lobby</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="ml-auto">
                <AvatarImage src={sessionQuery.data?.user?.avatarUrl} />
                <AvatarFallback />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a href={rpc.api.auth.logout.$url().toString()}>
                  Logout
                  <DropdownMenuShortcut>⌘L</DropdownMenuShortcut>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <Outlet />
      </div>
    </SessionContext.Provider>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
