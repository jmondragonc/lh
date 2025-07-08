import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import type {
  LonghornAuthenticatedRequest,
  LonghornUpdateGiftCardRequest,
} from "../../../../../types/longhorn-request-types";
import {
  GIFT_CARD_DELIVERY_STATUS,
  GIFT_CARD_TRANSACTION_TYPES,
} from "../../../../../modules/longhorn/models";

/**
 * GET /admin/longhorn/gift-cards/[id]
 * Obtiene una gift card específica por su ID
 */
export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log("=== GET /admin/longhorn/gift-cards/[id] ===");

    const longhornService = req.scope.resolve("longhorn");
    const { id } = req.params;

    const giftCards = await longhornService.listLonghornGiftCards({
      id,
      deleted_at: null,
    });

    if (giftCards.length === 0) {
      return res.status(404).json({
        message: "Gift card not found",
      });
    }

    const giftCard = giftCards[0];

    // Obtener transacciones de la gift card
    const transactions = await longhornService.listLonghornGiftCardTransactions(
      {
        gift_card_id: id,
        deleted_at: null,
      }
    );

    //console.log('📊 Found gift card:', giftCard.id, 'with', transactions.length, 'transactions')

    res.json({
      gift_card: {
        ...giftCard,
        transactions,
      },
    });
  } catch (error) {
    console.error("Error fetching gift card:", error);
    res.status(500).json({
      message: "Failed to fetch gift card",
      error: error.message,
    });
  }
};

/**
 * PUT /admin/longhorn/gift-cards/[id]
 * Actualiza una gift card específica
 */
export const PUT = async (
  req: LonghornUpdateGiftCardRequest,
  res: MedusaResponse
) => {
  try {
    console.log("=== PUT /admin/longhorn/gift-cards/[id] ===");
    console.log("Request body:", req.body);

    const longhornService = req.scope.resolve("longhorn");
    const { id } = req.params;
    const currentUserId = req.longhornAuth?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verificar que la gift card existe
    const existingGiftCards = await longhornService.listLonghornGiftCards({
      id,
      deleted_at: null,
    });

    if (existingGiftCards.length === 0) {
      return res.status(404).json({
        message: "Gift card not found",
      });
    }

    const currentGiftCard = existingGiftCards[0];

    // Extraer campos actualizables
    const {
      is_active,
      expiration_date,
      notes,
      sender_name,
      recipient_name,
      recipient_email,
      message,
      delivery_status,
      metadata,
    } = req.body;

    // Preparar datos de actualización
    const updateData: any = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (expiration_date !== undefined)
      updateData.expiration_date = expiration_date;
    if (notes !== undefined) updateData.notes = notes;
    if (sender_name !== undefined) updateData.sender_name = sender_name;
    if (recipient_name !== undefined)
      updateData.recipient_name = recipient_name;
    if (recipient_email !== undefined)
      updateData.recipient_email = recipient_email;
    if (message !== undefined) updateData.message = message;
    if (delivery_status !== undefined)
      updateData.delivery_status = delivery_status;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Actualizar gift card usando SQL directo
    const { Client } = require("pg");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    // Construir query dinámico basado en los campos a actualizar
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach((key) => {
      setClause.push(`${key} = $${paramIndex}`);
      values.push(updateData[key]);
      paramIndex++;
    });

    // Agregar updated_at
    setClause.push(`updated_at = $${paramIndex}`);
    values.push(new Date().toISOString());
    paramIndex++;

    // Agregar WHERE clause
    values.push(id);

    const query = `
      UPDATE longhorn_gift_card 
      SET ${setClause.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const result = await client.query(query, values);
    const updatedGiftCard = result.rows[0];
    await client.end();

    console.log("Gift card updated successfully:", updatedGiftCard.id);

    res.json({
      gift_card: updatedGiftCard,
      message: "Gift card updated successfully",
    });
  } catch (error) {
    console.error("Error updating gift card:", error);
    res.status(500).json({
      message: "Failed to update gift card",
      error: error.message,
    });
  }
};

/**
 * DELETE /admin/longhorn/gift-cards/[id]
 * Elimina (soft delete) una gift card
 */
export const DELETE = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log("=== DELETE /admin/longhorn/gift-cards/[id] ===");

    const longhornService = req.scope.resolve("longhorn");
    const { id } = req.params;

    // Verificar que la gift card existe
    const existingGiftCards = await longhornService.listLonghornGiftCards({
      id,
      deleted_at: null,
    });

    if (existingGiftCards.length === 0) {
      return res.status(404).json({
        message: "Gift card not found",
      });
    }

    // Soft delete usando SQL directo
    const { Client } = require("pg");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    await client.query(
      "UPDATE longhorn_gift_card SET deleted_at = $1, updated_at = $2 WHERE id = $3",
      [new Date().toISOString(), new Date().toISOString(), id]
    );
    await client.end();

    console.log("Gift card deleted successfully:", id);

    res.json({
      message: "Gift card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gift card:", error);
    res.status(500).json({
      message: "Failed to delete gift card",
      error: error.message,
    });
  }
};
