<?php

namespace Database\Seeders;

use App\Models\FoodItem;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    public function run(): void
    {
        $foods = [
            [
                'name' => 'Apple, Raw',
                'brand' => null,
                'serving_size' => 1,
                'serving_unit' => 'medium apple',
                'calories_per_serving' => 95,
                'protein_g' => 0.5,
                'carbs_g' => 25,
                'fat_g' => 0.3,
                'fiber_g' => 4,
                'verified' => true,
            ],
            [
                'name' => 'Banana, Raw',
                'brand' => null,
                'serving_size' => 1,
                'serving_unit' => 'medium banana',
                'calories_per_serving' => 105,
                'protein_g' => 1.3,
                'carbs_g' => 27,
                'fat_g' => 0.4,
                'fiber_g' => 3,
                'verified' => true,
            ],
            [
                'name' => 'Chicken Breast, Grilled',
                'brand' => null,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'calories_per_serving' => 165,
                'protein_g' => 31,
                'carbs_g' => 0,
                'fat_g' => 3.6,
                'fiber_g' => 0,
                'verified' => true,
            ],
            [
                'name' => 'Brown Rice, Cooked',
                'brand' => null,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'calories_per_serving' => 111,
                'protein_g' => 2.6,
                'carbs_g' => 23,
                'fat_g' => 0.9,
                'fiber_g' => 1.8,
                'verified' => true,
            ],
            [
                'name' => 'Greek Yogurt, Plain',
                'brand' => null,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'calories_per_serving' => 59,
                'protein_g' => 10,
                'carbs_g' => 3.6,
                'fat_g' => 0.4,
                'fiber_g' => 0,
                'verified' => true,
            ],
            [
                'name' => 'Salmon, Baked',
                'brand' => null,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'calories_per_serving' => 206,
                'protein_g' => 22,
                'carbs_g' => 0,
                'fat_g' => 12,
                'fiber_g' => 0,
                'verified' => true,
            ],
            [
                'name' => 'Broccoli, Steamed',
                'brand' => null,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'calories_per_serving' => 34,
                'protein_g' => 2.8,
                'carbs_g' => 7,
                'fat_g' => 0.4,
                'fiber_g' => 2.6,
                'verified' => true,
            ],
            [
                'name' => 'Whole Wheat Bread',
                'brand' => null,
                'serving_size' => 1,
                'serving_unit' => 'slice',
                'calories_per_serving' => 81,
                'protein_g' => 3.6,
                'carbs_g' => 13.8,
                'fat_g' => 1,
                'fiber_g' => 1.9,
                'verified' => true,
            ],
            [
                'name' => 'Egg, Hard Boiled',
                'brand' => null,
                'serving_size' => 1,
                'serving_unit' => 'large egg',
                'calories_per_serving' => 78,
                'protein_g' => 6.3,
                'carbs_g' => 0.6,
                'fat_g' => 5.3,
                'fiber_g' => 0,
                'verified' => true,
            ],
            [
                'name' => 'Avocado, Raw',
                'brand' => null,
                'serving_size' => 100,
                'serving_unit' => 'g',
                'calories_per_serving' => 160,
                'protein_g' => 2,
                'carbs_g' => 8.5,
                'fat_g' => 14.7,
                'fiber_g' => 6.7,
                'verified' => true,
            ],
        ];

        foreach ($foods as $food) {
            FoodItem::create($food);
        }
    }
}