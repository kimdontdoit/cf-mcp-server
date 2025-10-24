import { Hono } from "hono";
import { McpServer, StreamableHttpTransport } from "mcp-lite";
import { z } from "zod";
import { readFileSync } from "node:fs";

const mcp = new McpServer({
  name: "starter-mcp-lite-server",
  version: "1.0.0",
  schemaAdapter: (schema) => z.toJSONSchema(schema as z.ZodType)
});

mcp.tool("sum", {
  description: "Adds two numbers together",
  inputSchema: z.object({
    a: z.number(),
    b: z.number()
  }),
  handler: (args) => ({
    content: [{ type: "text", text: String(args.a + args.b) }]
  })
});

mcp.tool("consult_package_json", {
  description:
    "Reads and returns the contents of package.json in the current directory",
  inputSchema: z.object({}),
  handler: () => {
    try {
      const content = readFileSync("./package.json", "utf-8");
      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: "package.json not found. Please provide the package.json file."
          }
        ]
      };
    }
  }
});

const transport = new StreamableHttpTransport();
const httpHandler = transport.bind(mcp);

const app = new Hono();

app.all("/mcp", async (c) => {
  const response = await httpHandler(c.req.raw);
  return response;
});

app.get("/", (c) => {
  return c.text("MCP Server - Connect to /mcp");
});

export default app;
