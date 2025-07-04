import { Module } from "@medusajs/framework/utils"
import LonghornModuleService from "./service"

export const LONGHORN_MODULE = "longhorn"

export default Module(LONGHORN_MODULE, {
  service: LonghornModuleService
})

export * from "./models"