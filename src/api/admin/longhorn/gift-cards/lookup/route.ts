import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import type { LonghornAuthenticatedRequest } from "../../../../types/longhorn-auth";

/**
 * GET /admin/longhorn/gift-cards/lookup?code=XMAS2025ABC
 * Busca una gift card por su código
 */
export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    //console.log("=== GET /admin/longhorn/gift-cards/lookup ===");

    const longhornService = req.scope.resolve("longhorn");
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        message: "Code parameter is required",
      });
    }

    // Buscar gift card por código
    const giftCard = await longhornService.getGiftCardByCode(code);

    if (!giftCard) {
      return res.status(404).json({
        message: "Gift card not found",
        code,
      });
    }

    // Obtener transacciones de la gift card
    const transactions = await longhornService.getGiftCardTransactions(
      giftCard.id
    );

    // console.log('📊 Found gift card:', giftCard.id, 'with code:', code)
    // console.log('📊 Transactions:', transactions.length)

    res.json({
      gift_card: {
        ...giftCard,
        transactions,
      },
      lookup_code: code,
    });
  } catch (error) {
    console.error("Error looking up gift card:", error);
    res.status(500).json({
      message: "Failed to lookup gift card",
      error: error.message,
    });
  }
};
