import { NextRequest, NextResponse } from "next/server";

interface USDANutrient {
  nutrientId: number;
  value: number;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: USDANutrient[];
}

function getNutrient(nutrients: USDANutrient[], id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q?.trim()) {
    return NextResponse.json([]);
  }

  const apiKey = process.env.USDA_API_KEY ?? "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&pageSize=15&api_key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: "USDA API error" }, { status: 502 });
    }
    const data = await res.json();
    const foods = (data.foods ?? []) as USDAFoodItem[];

    const simplified = foods.map((food) => ({
      fdcId: food.fdcId,
      description: food.description,
      brandOwner: food.brandOwner,
      nutrients: {
        calories: getNutrient(food.foodNutrients, 1008),
        protein_g: getNutrient(food.foodNutrients, 1003),
        carbs_g: getNutrient(food.foodNutrients, 1005),
        fat_g: getNutrient(food.foodNutrients, 1004),
      },
    }));

    return NextResponse.json(simplified);
  } catch {
    return NextResponse.json({ error: "Failed to search foods" }, { status: 500 });
  }
}
