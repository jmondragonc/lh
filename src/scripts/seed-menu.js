#!/usr/bin/env node

/**
 * Script de seeding para poblar la carta de Longhorn
 * Este script crea categorías y productos realistas
 */

const { MENU_CATEGORY_TYPES } = require("../src/modules/longhorn/models/menu-category")
const { DISH_TYPES, COOKING_POINTS, SPICE_LEVELS } = require("../src/modules/longhorn/models/menu-item")

async function seedLonghornMenu() {
  console.log('🍽️ === INICIANDO SEEDING DE CARTA LONGHORN ===')
  
  try {
    // Datos de categorías realistas
    console.log('✅ Categorías de menú que se crearán:')
    const categories = [
      {
        name: "Entradas",
        description: "Deliciosos aperitivos para comenzar",
        type: MENU_CATEGORY_TYPES.ENTRADA,
        display_order: 1
      },
      {
        name: "Carnes Premium",
        description: "Cortes selectos a la parrilla", 
        type: MENU_CATEGORY_TYPES.CARNE,
        display_order: 2
      },
      {
        name: "Especialidades de Pollo",
        description: "Pollo preparado de diversas formas",
        type: MENU_CATEGORY_TYPES.POLLO,
        display_order: 3
      },
      {
        name: "Costillas de Cerdo",
        description: "Costillas tiernas con salsas especiales",
        type: MENU_CATEGORY_TYPES.CERDO,
        display_order: 4
      },
      {
        name: "Del Mar",
        description: "Pescados y mariscos frescos",
        type: MENU_CATEGORY_TYPES.MARISCOS,
        display_order: 5
      },
      {
        name: "Acompañamientos",
        description: "Guarniciones perfectas",
        type: MENU_CATEGORY_TYPES.ACOMPAÑAMIENTO,
        display_order: 6
      },
      {
        name: "Ensaladas Frescas",
        description: "Ensaladas nutritivas y deliciosas",
        type: MENU_CATEGORY_TYPES.ENSALADA,
        display_order: 7
      },
      {
        name: "Postres",
        description: "El final perfecto para tu comida",
        type: MENU_CATEGORY_TYPES.POSTRE,
        display_order: 8
      },
      {
        name: "Bebidas",
        description: "Refrescantes y variadas",
        type: MENU_CATEGORY_TYPES.BEBIDA,
        display_order: 9
      },
      {
        name: "Cocteles Especiales",
        description: "Preparados únicos de la casa",
        type: MENU_CATEGORY_TYPES.COCTEL,
        display_order: 10
      },
      {
        name: "Carta de Vinos",
        description: "Selección premium nacional e internacional",
        type: MENU_CATEGORY_TYPES.VINO,
        display_order: 11
      }
    ]

    categories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.description}`)
    })

    console.log('\n🥩 Items de menú que se crearán:')
    
    // Datos de productos realistas basados en steakhouses peruanos
    const menuItems = [
      // === ENTRADAS ===
      {
        name: "Alitas BBQ Longhorn",
        description: "10 alitas de pollo marinadas 24 horas, bañadas en nuestra salsa BBQ especial ahumada, acompañadas de bastones de apio y aderezo ranch casero",
        short_description: "Alitas con salsa BBQ ahumada especial",
        category_type: MENU_CATEGORY_TYPES.ENTRADA,
        dish_type: DISH_TYPES.COMPARTIR,
        ingredients: ["Alitas de pollo", "Salsa BBQ ahumada", "Apio", "Aderezo ranch", "Especias secretas"],
        allergens: ["Gluten", "Lácteos"],
        base_price: 3290, // S/32.90
        preparation_time: 18,
        is_popular: true,
        is_spicy: false,
        weight: 400,
        proteins: 35,
        calories: 580
      },
      {
        name: "Nachos Supremos Longhorn",
        description: "Nachos artesanales cubiertos con queso cheddar derretido, carne molida sazonada, pico de gallo fresco, guacamole de palta, crema agria y jalapeños",
        short_description: "Nachos cargados con todos los ingredientes",
        category_type: MENU_CATEGORY_TYPES.ENTRADA,
        dish_type: DISH_TYPES.COMPARTIR,
        ingredients: ["Nachos artesanales", "Queso cheddar", "Carne molida", "Pico de gallo", "Guacamole", "Crema agria", "Jalapeños"],
        allergens: ["Gluten", "Lácteos"],
        base_price: 3890, // S/38.90
        preparation_time: 15,
        is_popular: true,
        spice_level: SPICE_LEVELS.SUAVE,
        calories: 720
      },
      {
        name: "Tequeños de Queso",
        description: "8 tequeños crujientes rellenos de queso venezolano, acompañados de salsa tártara y ají de la casa",
        short_description: "Tequeños crujientes con queso",
        category_type: MENU_CATEGORY_TYPES.ENTRADA,
        dish_type: DISH_TYPES.COMPARTIR,
        ingredients: ["Masa de tequeño", "Queso venezolano", "Aceite vegetal", "Salsa tártara"],
        allergens: ["Gluten", "Lácteos", "Huevos"],
        base_price: 2890, // S/28.90
        preparation_time: 12,
        is_vegetarian: true,
        calories: 420
      },

      // === CARNES PREMIUM ===
      {
        name: "Ribeye Premium 350g",
        description: "Corte ribeye de 350g, jugoso y marmoleado, procedente de ganado seleccionado, asado a la parrilla según su preferencia, acompañado de mantequilla de hierbas",
        short_description: "Ribeye premium 350g con mantequilla de hierbas",
        category_type: MENU_CATEGORY_TYPES.CARNE,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Carne ribeye 350g", "Mantequilla de hierbas", "Sal de mar", "Pimienta negra molida"],
        cooking_points_available: [COOKING_POINTS.JUGOSO, COOKING_POINTS.A_PUNTO, COOKING_POINTS.TRES_CUARTOS, COOKING_POINTS.BIEN_COCIDO],
        base_price: 10990, // S/109.90
        preparation_time: 25,
        weight: 350,
        proteins: 75,
        is_popular: true,
        is_gluten_free: true,
        calories: 850
      },
      {
        name: "Bife de Chorizo Argentino",
        description: "Clásico bife de chorizo de 300g importado de Argentina, tierno y sabroso, marinado en chimichurri tradicional",
        short_description: "Bife argentino con chimichurri tradicional",
        category_type: MENU_CATEGORY_TYPES.CARNE,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Bife de chorizo argentino 300g", "Chimichurri", "Sal parrillera", "Aceite de oliva"],
        cooking_points_available: [COOKING_POINTS.JUGOSO, COOKING_POINTS.A_PUNTO, COOKING_POINTS.TRES_CUARTOS],
        base_price: 8990, // S/89.90
        preparation_time: 22,
        weight: 300,
        proteins: 68,
        is_popular: true,
        is_gluten_free: true,
        calories: 720
      },
      {
        name: "T-Bone Gigante 500g",
        description: "Impresionante T-Bone de 500g que combina filete y lomo, perfecto para compartir o para los grandes apetitos",
        short_description: "T-Bone de 500g para compartir",
        category_type: MENU_CATEGORY_TYPES.CARNE,
        dish_type: DISH_TYPES.COMPARTIR,
        ingredients: ["T-Bone 500g", "Sal de mar", "Pimienta", "Romero fresco"],
        cooking_points_available: [COOKING_POINTS.JUGOSO, COOKING_POINTS.A_PUNTO, COOKING_POINTS.TRES_CUARTOS],
        base_price: 13990, // S/139.90
        preparation_time: 30,
        weight: 500,
        proteins: 95,
        is_gluten_free: true,
        calories: 1200
      },

      // === ESPECIALIDADES DE POLLO ===
      {
        name: "Pollo a la Plancha Mediterráneo",
        description: "Pechuga de pollo marinada en hierbas mediterráneas, cocinada a la plancha, acompañada de vegetales asados de estación",
        short_description: "Pechuga mediterránea con vegetales asados",
        category_type: MENU_CATEGORY_TYPES.POLLO,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Pechuga de pollo", "Hierbas mediterráneas", "Vegetales de estación", "Aceite de oliva", "Limón"],
        base_price: 5490, // S/54.90
        preparation_time: 18,
        weight: 250,
        proteins: 48,
        calories: 420,
        is_gluten_free: true,
        is_healthy: true
      },
      {
        name: "Pollo BBQ Desmenuzado",
        description: "Pollo desmenuzado cocido lentamente en salsa BBQ, servido en pan brioche con ensalada coleslaw",
        short_description: "Pulled chicken en pan brioche",
        category_type: MENU_CATEGORY_TYPES.POLLO,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Pollo desmenuzado", "Salsa BBQ", "Pan brioche", "Coleslaw", "Pepinillos"],
        allergens: ["Gluten", "Lácteos", "Huevos"],
        base_price: 4890, // S/48.90
        preparation_time: 15,
        calories: 650
      },

      // === COSTILLAS DE CERDO ===
      {
        name: "Costillas Baby Back Ribs",
        description: "Costillas de cerdo tiernas cocidas a fuego lento por 6 horas, glaseadas con salsa BBQ de la casa y acompañadas de ensalada coleslaw",
        short_description: "Costillas cocidas 6 horas con BBQ casero",
        category_type: MENU_CATEGORY_TYPES.CERDO,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Costillas de cerdo", "Salsa BBQ casera", "Coleslaw", "Especias secretas"],
        allergens: ["Lácteos"],
        base_price: 7890, // S/78.90
        preparation_time: 20, // Ya están precocidas
        weight: 400,
        proteins: 55,
        is_popular: true,
        calories: 820
      },

      // === DEL MAR ===
      {
        name: "Salmón a la Parrilla",
        description: "Filete de salmón fresco a la parrilla con costra de hierbas, acompañado de arroz pilaf y vegetales salteados",
        short_description: "Salmón con costra de hierbas",
        category_type: MENU_CATEGORY_TYPES.MARISCOS,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Filete de salmón", "Hierbas frescas", "Arroz pilaf", "Vegetales mixtos"],
        allergens: ["Pescado"],
        base_price: 6890, // S/68.90
        preparation_time: 16,
        weight: 200,
        proteins: 42,
        is_gluten_free: true,
        is_healthy: true,
        calories: 520
      },

      // === ACOMPAÑAMIENTOS ===
      {
        name: "Papas Fritas Rústicas",
        description: "Papas cortadas gruesas con cáscara, sazonadas con romero y sal de mar, doradas hasta quedar crujientes por fuera y suaves por dentro",
        short_description: "Papas rústicas con romero",
        category_type: MENU_CATEGORY_TYPES.ACOMPAÑAMIENTO,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Papas con cáscara", "Romero fresco", "Sal de mar", "Aceite vegetal"],
        base_price: 1890, // S/18.90
        preparation_time: 12,
        weight: 200,
        carbs: 45,
        is_vegetarian: true,
        is_vegan: true,
        calories: 320
      },
      {
        name: "Arroz con Cilantro",
        description: "Arroz jazmín cocido al vapor con cilantro fresco picado y mantequilla, perfecto acompañamiento para carnes",
        short_description: "Arroz jazmín con cilantro fresco",
        category_type: MENU_CATEGORY_TYPES.ACOMPAÑAMIENTO,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Arroz jazmín", "Cilantro fresco", "Mantequilla", "Sal"],
        allergens: ["Lácteos"],
        base_price: 1590, // S/15.90
        preparation_time: 8,
        carbs: 52,
        is_vegetarian: true,
        calories: 280
      },
      {
        name: "Vegetales Asados",
        description: "Selección de vegetales de estación asados a la parrilla: zapallo, zanahoria, brócoli y pimientos, marinados en aceite de oliva y hierbas",
        short_description: "Mix de vegetales asados de estación",
        category_type: MENU_CATEGORY_TYPES.ACOMPAÑAMIENTO,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Zapallo", "Zanahoria", "Brócoli", "Pimientos", "Aceite de oliva", "Hierbas"],
        base_price: 2190, // S/21.90
        preparation_time: 15,
        is_vegetarian: true,
        is_vegan: true,
        is_gluten_free: true,
        is_healthy: true,
        calories: 120
      },

      // === ENSALADAS ===
      {
        name: "Ensalada Caesar con Pollo",
        description: "Lechuga romana fresca, crutones caseros, queso parmesano, pechuga de pollo a la plancha y aderezo caesar tradicional",
        short_description: "Caesar clásica con pollo grillado",
        category_type: MENU_CATEGORY_TYPES.ENSALADA,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Lechuga romana", "Pollo grillado", "Crutones", "Parmesano", "Aderezo caesar"],
        allergens: ["Gluten", "Lácteos", "Huevos", "Pescado"],
        base_price: 3890, // S/38.90
        preparation_time: 12,
        proteins: 35,
        is_popular: true,
        calories: 450
      },

      // === POSTRES ===
      {
        name: "Brownie Volcán con Helado",
        description: "Brownie de chocolate belga tibio con centro derretido, acompañado de helado de vainilla artesanal, salsa de chocolate caliente y fresas frescas",
        short_description: "Brownie volcán con helado artesanal",
        category_type: MENU_CATEGORY_TYPES.POSTRE,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Brownie de chocolate belga", "Helado de vainilla", "Salsa de chocolate", "Fresas frescas", "Menta"],
        allergens: ["Gluten", "Lácteos", "Huevos", "Frutos secos"],
        base_price: 2890, // S/28.90
        preparation_time: 8,
        calories: 620,
        is_vegetarian: true,
        is_popular: true
      },
      {
        name: "Cheesecake de Maracuyá",
        description: "Cheesecake cremoso con base de galleta, cubierto con coulis de maracuyá peruano y decorado con fruta fresca",
        short_description: "Cheesecake con coulis de maracuyá",
        category_type: MENU_CATEGORY_TYPES.POSTRE,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Queso crema", "Galletas", "Maracuyá", "Azúcar", "Huevos"],
        allergens: ["Gluten", "Lácteos", "Huevos"],
        base_price: 2590, // S/25.90
        preparation_time: 5,
        calories: 480,
        is_vegetarian: true
      },

      // === BEBIDAS ===
      {
        name: "Limonada Frozen de Casa",
        description: "Refrescante limonada preparada con limones frescos, endulzada naturalmente y servida con hielo frappe y menta del huerto",
        short_description: "Limonada natural con menta fresca",
        category_type: MENU_CATEGORY_TYPES.BEBIDA,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Limones frescos", "Azúcar rubia", "Agua", "Hielo", "Menta fresca"],
        base_price: 1490, // S/14.90
        preparation_time: 5,
        is_vegetarian: true,
        is_vegan: true,
        is_healthy: true,
        calories: 80
      },
      {
        name: "Chicha Morada Premium",
        description: "Chicha morada artesanal preparada con maíz morado, piña, canela y clavo de olor, endulzada naturalmente",
        short_description: "Chicha morada artesanal",
        category_type: MENU_CATEGORY_TYPES.BEBIDA,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Maíz morado", "Piña", "Canela", "Clavo de olor", "Azúcar rubia"],
        base_price: 1590, // S/15.90
        preparation_time: 3,
        is_vegetarian: true,
        is_vegan: true,
        calories: 120
      },

      // === COCTELES ===
      {
        name: "Pisco Sour Clásico",
        description: "El clásico peruano preparado con pisco quebranta, limón, jarabe de goma, clara de huevo y amargo de angostura",
        short_description: "Pisco Sour tradicional peruano",
        category_type: MENU_CATEGORY_TYPES.COCTEL,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Pisco quebranta", "Limón", "Jarabe de goma", "Clara de huevo", "Amargo de angostura"],
        allergens: ["Huevos"],
        base_price: 2890, // S/28.90
        preparation_time: 8,
        min_age_required: 18,
        is_popular: true,
        calories: 180
      },
      {
        name: "Mojito de Hierba Buena",
        description: "Refrescante mojito preparado con ron blanco, hierba buena fresca, lima, azúcar rubia y agua con gas",
        short_description: "Mojito refrescante con hierba buena",
        category_type: MENU_CATEGORY_TYPES.COCTEL,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Ron blanco", "Hierba buena", "Lima", "Azúcar rubia", "Agua con gas"],
        base_price: 2590, // S/25.90
        preparation_time: 6,
        min_age_required: 18,
        calories: 160
      },

      // === VINOS ===
      {
        name: "Vino Tinto Reserva Casa Blanca",
        description: "Vino tinto de la bodega Casa Blanca, con notas frutales y taninos suaves, perfecto acompañamiento para carnes rojas",
        short_description: "Tinto reserva nacional",
        category_type: MENU_CATEGORY_TYPES.VINO,
        dish_type: DISH_TYPES.INDIVIDUAL,
        ingredients: ["Uva Cabernet Sauvignon", "Uva Merlot"],
        base_price: 4890, // S/48.90 copa / S/189.90 botella
        preparation_time: 2,
        min_age_required: 18,
        calories: 125
      }
    ]

    menuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} - S/${(item.base_price / 100).toFixed(2)}`)
      console.log(`     ${item.short_description}`)
    })

    console.log(`\n📊 RESUMEN:`)
    console.log(`✅ Categorías: ${categories.length}`)
    console.log(`🍽️ Items de menú: ${menuItems.length}`)
    console.log(`💰 Rango de precios: S/${Math.min(...menuItems.map(i => i.base_price))/100} - S/${Math.max(...menuItems.map(i => i.base_price))/100}`)
    
    // Agrupar por categorías
    const itemsByCategory = {}
    menuItems.forEach(item => {
      const categoryType = item.category_type
      if (!itemsByCategory[categoryType]) {
        itemsByCategory[categoryType] = []
      }
      itemsByCategory[categoryType].push(item.name)
    })
    
    console.log(`\n📋 DISTRIBUCIÓN POR CATEGORÍA:`)
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      console.log(`  ${category}: ${items.length} items`)
    })

    console.log('\n🎯 CARACTERÍSTICAS ESPECIALES:')
    console.log(`  🌱 Vegetarianos: ${menuItems.filter(i => i.is_vegetarian).length}`)
    console.log(`  🌿 Veganos: ${menuItems.filter(i => i.is_vegan).length}`)
    console.log(`  🚫 Sin gluten: ${menuItems.filter(i => i.is_gluten_free).length}`)
    console.log(`  🔥 Populares: ${menuItems.filter(i => i.is_popular).length}`)
    console.log(`  💪 Saludables: ${menuItems.filter(i => i.is_healthy).length}`)
    console.log(`  🔞 Solo adultos: ${menuItems.filter(i => i.min_age_required).length}`)

    console.log('\n✅ === SEEDING COMPLETADO EXITOSAMENTE ===')
    console.log('📌 Nota: Este es un preview de los datos. Para ejecutar el seeding real, usar: npm run seed:menu')
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    process.exit(1)
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  seedLonghornMenu()
    .then(() => {
      console.log('\n🎉 Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Error:', error)
      process.exit(1)
    })
}

module.exports = { seedLonghornMenu }
