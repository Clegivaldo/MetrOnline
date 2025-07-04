<?php

namespace App\Http\Controllers;

use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DocumentCategoryController extends Controller
{
    public function index()
    {
        $categories = DocumentCategory::with('parent')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function tree()
    {
        $categories = DocumentCategory::whereNull('parent_id')
            ->with('children')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:document_categories,code',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:document_categories,id',
            'is_active' => 'boolean'
        ]);

        // Gerar code automaticamente se não enviado
        if (empty($validated['code'])) {
            $validated['code'] = Str::slug($validated['name'], '-');
        }

        $category = DocumentCategory::create($validated);

        return response()->json($category, 201);
    }

    public function show(DocumentCategory $category)
    {
        return response()->json($category->load('parent', 'children'));
    }

    public function update(Request $request, $id)
    {
        $category = DocumentCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $category->update($validated);
        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = DocumentCategory::findOrFail($id);
        $category->delete();
        return response()->json(null, 204);
    }
}
