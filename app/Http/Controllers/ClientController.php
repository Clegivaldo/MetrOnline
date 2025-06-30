<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients = Client::withCount('certificates')->orderBy('company_name')->get();
        
        return response()->json($clients);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'cnpj' => 'required|string|unique:clients,cnpj',
            'company_name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip_code' => 'nullable|string|max:10',
        ]);

        // Gerar senha padrão se não for fornecida
        $password = $request->password ?: '123456';

        $client = Client::create([
            'cnpj' => $request->cnpj,
            'company_name' => $request->company_name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'zip_code' => $request->zip_code,
        ]);

        // Log de auditoria
        AuditLog::create([
            'action' => 'Cliente criado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'details' => ['client_id' => $client->id, 'company_name' => $client->company_name],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'client' => $client,
            'password' => $password // Retornar a senha gerada
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        return response()->json($client->load('certificates'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        $request->validate([
            'cnpj' => ['required', 'string', 'size:14', Rule::unique('clients')->ignore($client->id)],
            'company_name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('clients')->ignore($client->id)],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip_code' => 'nullable|string|max:10',
        ]);

        $client->update($request->only([
            'cnpj', 'company_name', 'email', 'phone', 'address', 'city', 'state', 'zip_code'
        ]));

        // Log de auditoria
        AuditLog::create([
            'action' => 'Cliente atualizado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'details' => ['client_id' => $client->id, 'company_name' => $client->company_name],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($client);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Client $client)
    {
        // Log de auditoria
        AuditLog::create([
            'action' => 'Cliente deletado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'details' => ['client_id' => $client->id, 'company_name' => $client->company_name],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $client->delete();

        return response()->json(['message' => 'Cliente deletado com sucesso']);
    }

    /**
     * Consultar dados do CNPJ
     */
    public function consultCNPJ(Request $request, $cnpj)
    {
        $request->validate([
            'cnpj' => 'required|string|size:14',
        ]);

        try {
            // Simular consulta CNPJ (você pode integrar com uma API real)
            $response = Http::get("https://brasilapi.com.br/api/cnpj/v1/{$cnpj}");
            
            if ($response->successful()) {
                $data = $response->json();
                
                return response()->json([
                    'company_name' => $data['razao_social'] ?? '',
                    'phone' => $data['ddd_telefone_1'] ? "({$data['ddd_telefone_1']}) {$data['telefone_1']}" : '',
                    'address' => $data['logradouro'] ?? '',
                    'city' => $data['municipio'] ?? '',
                    'state' => $data['uf'] ?? '',
                    'zip_code' => $data['cep'] ?? '',
                ]);
            }
            
            return response()->json(['error' => 'CNPJ não encontrado'], 404);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao consultar CNPJ'], 500);
        }
    }
}
