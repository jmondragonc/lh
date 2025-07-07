import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/longhorn/*",
      middlewares: [authenticate("user", "session")],
    },
  ],
})
