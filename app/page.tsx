const advantages = [
  "Edits files and runs commands directly in your terminal",
  "Understands your full codebase context automatically",
  "Creates, refactors, and debugs code end-to-end",
  "Runs tests and fixes failures autonomously",
  "Works with any language, framework, or toolchain",
  "Integrates with Git for commits, branches, and PRs",
  "Extensible via MCP servers and custom hooks",
];

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-xl w-full px-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Claude Code</h1>
        <ul className="space-y-3">
          {advantages.map((adv) => (
            <li key={adv} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <span className="text-lg">{adv}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
