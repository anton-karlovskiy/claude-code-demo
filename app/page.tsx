export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold mb-6">Hello World</h1>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>Runs directly in your terminal alongside your code</li>
          <li>Reads and edits files across your entire codebase</li>
          <li>Executes shell commands and runs tests on your behalf</li>
          <li>Understands project context without manual copy-pasting</li>
          <li>Supports Git workflows — commits, diffs, and branch management</li>
          <li>Extensible via MCP servers and custom hooks</li>
        </ul>
      </div>
    </div>
  );
}
