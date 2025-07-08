import { Outlet } from "react-router-dom"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const GiftCardsLayout = () => {
  return <Outlet />
}

export const config = defineRouteConfig({
  label: "Gift Cards",
})

export default GiftCardsLayout
