<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $perms = [
            ['name' => 'view-training', 'label' => 'Visualizar treinamentos'],
            ['name' => 'create-training', 'label' => 'Criar treinamentos'],
            ['name' => 'update-training', 'label' => 'Editar treinamentos'],
            ['name' => 'delete-training', 'label' => 'Excluir treinamentos'],
            ['name' => 'view-equipment', 'label' => 'Visualizar equipamentos'],
            ['name' => 'create-equipment', 'label' => 'Criar equipamentos'],
            ['name' => 'update-equipment', 'label' => 'Editar equipamentos'],
            ['name' => 'delete-equipment', 'label' => 'Excluir equipamentos'],
            ['name' => 'view-non-conformity', 'label' => 'Visualizar não conformidades'],
            ['name' => 'create-non-conformity', 'label' => 'Criar não conformidades'],
            ['name' => 'update-non-conformity', 'label' => 'Editar não conformidades'],
            ['name' => 'delete-non-conformity', 'label' => 'Excluir não conformidades'],
            ['name' => 'view-internal-audit', 'label' => 'Visualizar auditorias internas'],
            ['name' => 'create-internal-audit', 'label' => 'Criar auditorias internas'],
            ['name' => 'update-internal-audit', 'label' => 'Editar auditorias internas'],
            ['name' => 'delete-internal-audit', 'label' => 'Excluir auditorias internas'],
            ['name' => 'view-document', 'label' => 'Visualizar documentos'],
            ['name' => 'create-document', 'label' => 'Criar documentos'],
            ['name' => 'update-document', 'label' => 'Editar documentos'],
            ['name' => 'delete-document', 'label' => 'Excluir documentos'],
            ['name' => 'manage-permissions', 'label' => 'Gerenciar permissões'],
            ['name' => 'manage-categories', 'label' => 'Gerenciar categorias de documentos'],
        ];
        foreach ($perms as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }
    }
} 