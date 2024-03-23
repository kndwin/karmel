import { Link, createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "~/shared/ui/card";

export const Route = createFileRoute("/home/")({
  component: Component,
});

function Component() {
  return (
    <div>
      <main className="flex-1">
        <div className="container space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Choose a Game
          </h1>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Select one of the games below to start playing.
          </p>
        </div>
        <div className="container grid gap-10 py-10 lg:gap-16 lg:py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/home/glada" search={{ roomId: "" }}>
              <Card className="flex flex-col h-full pt-8 hover:bg-accent">
                <CardContent className="flex-1 flex flex-col items-center justify-center">
                  <img
                    alt="Game icon"
                    className="fill-current w-24 h-24 rounded aspect-square object-cover"
                    src="https://api.dicebear.com/7.x/shapes/svg?seed=Go"
                  />
                  <h3 className="mt-4 text-xl font-bold">Gladiators</h3>
                  <p className="mt-2 text-sm text-center text-gray-500">
                    2 players | 10 minutes
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Card className="flex flex-col h-full pt-8 bg-accent opacity-50">
              <CardContent className="flex-1 flex flex-col items-center justify-center">
                <img
                  alt="Game icon"
                  className="fill-current w-24 h-24 rounded aspect-square object-cover"
                  src="https://api.dicebear.com/7.x/shapes/svg?seed=Go"
                />
                <h3 className="mt-4 text-xl font-bold">Game Two</h3>
                <p className="mt-2 text-sm text-center text-gray-500">
                  A description of the second game.
                </p>
              </CardContent>
            </Card>
            <Card className="flex flex-col h-full pt-8 bg-accent opacity-50">
              <CardContent className="flex-1 flex flex-col items-center justify-center">
                <img
                  alt="Game icon"
                  className="fill-current w-24 h-24"
                  height="96"
                  src="https://api.dicebear.com/7.x/shapes/svg?seed=Max"
                  style={{
                    aspectRatio: "96/96",
                    objectFit: "cover",
                  }}
                  width="96"
                />
                <h3 className="mt-4 text-xl font-bold">Game Three</h3>
                <p className="mt-2 text-sm text-center text-gray-500">
                  A description of the third game.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
