<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodCategory extends Model
{
    protected $fillable = [
        'name',
        'parent_id',
        'icon_url',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(FoodCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(FoodCategory::class, 'parent_id');
    }

    public function foodItems(): HasMany
    {
        return $this->hasMany(FoodItem::class);
    }
}
