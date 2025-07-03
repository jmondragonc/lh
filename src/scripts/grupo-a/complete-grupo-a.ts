/**
 * Script para completar GRUPO A: Infraestructura Base
 * 
 * FALTABAN:
 * - Sales Channels específicos para cada sede Longhorn
 * - Stock Locations con direcciones reales de restaurantes
 * - Regions configuradas para Perú/Lima
 * - Links entre Sales Channels y Stock Locations
 * - Integración con modelos Longhorn existentes
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function completeGrupoA({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  logger.info("🚀 Iniciando completado del GRUPO A: Infraestructura Base")

  try {
    // ======================================
    // 1. CREAR REGION PERÚ
    // ======================================
    logger.info("📍 Creando Region Perú...")
    
    const regionData = {
      id: "reg_peru",
      name: "Perú",
      currency_code: "PEN",
      automatic_taxes: true,
      metadata: {
        country_code: "PE",
        timezone: "America/Lima",
        longhorn_region: true,
        delivery_enabled: true
      }
    }

    await query.graph({
      entity: "region",
      fields: ["id"],
      filters: { id: "reg_peru" }
    }).then(async (existing) => {
      if (existing.data.length === 0) {
        // Usar servicio directo para crear la región
        const regionService = container.resolve("regionModuleService")
        await regionService.createRegions