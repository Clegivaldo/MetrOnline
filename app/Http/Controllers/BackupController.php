<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use ZipArchive;

class BackupController extends Controller
{
    /**
     * Listar backups
     */
    public function index()
    {
        $backups = [];
        $backupPath = storage_path('app/backups');
        
        if (is_dir($backupPath)) {
            $files = glob($backupPath . '/*.zip');
            
            foreach ($files as $file) {
                $backups[] = [
                    'filename' => basename($file),
                    'size' => $this->formatBytes(filesize($file)),
                    'created_at' => date('Y-m-d H:i:s', filemtime($file)),
                ];
            }
        }

        return response()->json($backups);
    }

    /**
     * Criar backup
     */
    public function create(Request $request)
    {
        try {
            $backupPath = storage_path('app/backups');
            if (!is_dir($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            $filename = 'backup_' . now()->format('Y-m-d_H-i-s') . '.zip';
            $zipPath = $backupPath . '/' . $filename;

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE) !== TRUE) {
                return response()->json(['error' => 'Não foi possível criar o arquivo ZIP'], 500);
            }

            // Backup do banco de dados
            $dbPath = database_path('database.sqlite');
            if (file_exists($dbPath)) {
                $zip->addFile($dbPath, 'database.sqlite');
            }

            // Backup dos uploads
            $uploadsPath = storage_path('app/public');
            if (is_dir($uploadsPath)) {
                $this->addFolderToZip($zip, $uploadsPath, 'uploads');
            }

            $zip->close();

            return response()->json([
                'message' => 'Backup criado com sucesso',
                'filename' => $filename,
                'size' => $this->formatBytes(filesize($zipPath))
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao criar backup: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download do backup
     */
    public function download($filename)
    {
        $backupPath = storage_path('app/backups/' . $filename);
        
        if (!file_exists($backupPath)) {
            return response()->json(['error' => 'Backup não encontrado'], 404);
        }

        return response()->download($backupPath);
    }

    /**
     * Excluir backup
     */
    public function destroy($filename)
    {
        $backupPath = storage_path('app/backups/' . $filename);
        
        if (!file_exists($backupPath)) {
            return response()->json(['error' => 'Backup não encontrado'], 404);
        }

        unlink($backupPath);

        return response()->json(['message' => 'Backup excluído com sucesso']);
    }

    /**
     * Adicionar pasta ao ZIP
     */
    private function addFolderToZip($zip, $folder, $zipFolder)
    {
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($folder),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = $zipFolder . '/' . substr($filePath, strlen($folder) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }
    }

    /**
     * Formatar bytes
     */
    private function formatBytes($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
