import { defineMiddlewares } from "@medusajs/framework"
import { authenticateAdminUser } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/longhorn/*",
      middlewares: [authenticateAdminUser],
    },
  ],
})
