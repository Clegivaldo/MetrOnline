<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanySettingController extends Controller
{
    /**
     * Display the company settings
     */
    public function index()
    {
        $company = CompanySetting::first();
        return response()->json($company);
    }

    /**
     * Store or update company settings
     */
    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'cnpj' => 'required|string|max:18',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip_code' => 'nullable|string|max:10',
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $company = CompanySetting::first();

        $data = $request->except('logo');

        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($company && $company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            
            $logoPath = $request->file('logo')->store('company', 'public');
            $data['logo_path'] = $logoPath;
        }

        if ($company) {
            $company->update($data);
        } else {
            $company = CompanySetting::create($data);
        }

        return response()->json($company);
    }
}
