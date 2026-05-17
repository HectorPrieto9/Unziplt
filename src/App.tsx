/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { 
  Settings, 
  HelpCircle, 
  Download, 
  Trash2, 
  Search, 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Code, 
  File as FileIcon,
  Upload,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';

export default function App() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState<any[]>([]);
  const [zipName, setZipName] = useState("");
  const [zipSize, setZipSize] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setZipName(file.name);
    const sizeInMB = file.size / (1024 * 1024);
    setZipSize(`${sizeInMB.toFixed(1)} MB`);
    setIsExtracting(true);

    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const files: any[] = [];

      content.forEach((relativePath, zipEntry) => {
        const type = zipEntry.dir ? 'DIR' : relativePath.split('.').pop()?.toUpperCase() || 'FILE';
        files.push({
          name: relativePath,
          size: zipEntry.dir ? '--' : `${(zipEntry.uncompressedSize / 1024).toFixed(1)} KB`,
          type: type,
          isDir: zipEntry.dir,
          raw: zipEntry
        });
      });

      setExtractedFiles(files);
    } catch (error) {
      console.error("Error unzipping file:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredFiles = extractedFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadFile = async (file: any) => {
    if (file.isDir) return;
    const content = await file.raw.async('blob');
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.split('/').pop() || 'file';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'DIR': return <Folder className="text-secondary w-6 h-6" />;
      case 'PDF':
      case 'DOCX': return <FileText className="text-primary w-6 h-6" />;
      case 'PNG':
      case 'JPG': return <ImageIcon className="text-tertiary w-6 h-6" />;
      case 'JS':
      case 'TS':
      case 'TSX':
      case 'JSX': return <Code className="text-secondary w-6 h-6" />;
      default: return <FileIcon className="text-on-surface-variant w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
      {/* TopAppBar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">UnzipIt</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="font-semibold text-primary border-b-2 border-primary pb-1">Herramientas</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Seguridad</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Precios</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Soporte</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <Settings className="w-5 h-5 text-on-surface-variant" />
            </button>
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <HelpCircle className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-12">
        {!zipName ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".zip" 
              onChange={handleFileUpload}
            />
            <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Arrastra tu archivo ZIP aquí</h2>
            <p className="text-on-surface-variant">o haz clic para seleccionar un archivo de tu ordenador</p>
            {isExtracting && <p className="mt-4 text-primary animate-pulse font-medium">Procesando archivo...</p>}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Header & Status */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">Extracción Completada</h1>
                <button 
                  onClick={() => { setZipName(""); setExtractedFiles([]); }}
                  className="p-2 hover:bg-surface-container rounded-full"
                >
                  <X className="w-6 h-6 text-on-surface-variant" />
                </button>
              </div>
              <p className="text-lg text-on-surface-variant mb-6">{zipName} ({zipSize})</p>
              
              <div className="w-full bg-surface-container rounded-full h-2 mb-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="bg-primary h-full rounded-full" 
                />
              </div>
              <div className="flex justify-between text-sm font-medium text-on-surface-variant">
                <span>100% Completado</span>
                <span>{extractedFiles.length} archivos extraídos</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-outline-variant">
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-container transition-all hover:-translate-y-0.5 shadow-sm active:scale-95">
                  <Download className="w-5 h-5" />
                  Descargar Todo
                </button>
                <button 
                  onClick={() => { setZipName(""); setExtractedFiles([]); }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-outline text-on-surface-variant px-6 py-3 rounded-xl font-semibold hover:bg-surface-container transition-colors active:scale-95"
                >
                  <Trash2 className="w-5 h-5" />
                  Borrar
                </button>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="text" 
                  placeholder="Filtrar archivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* File List */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low border-b border-outline-variant font-semibold text-on-surface-variant uppercase text-xs tracking-wider">
                <div className="col-span-12 md:col-span-7">Nombre</div>
                <div className="hidden md:block md:col-span-2 text-right">Tamaño</div>
                <div className="hidden md:block md:col-span-3 text-right">Acción</div>
              </div>
              
              <div className="divide-y divide-outline-variant">
                <AnimatePresence>
                  {filteredFiles.map((file, index) => (
                    <motion.div 
                      key={file.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low transition-colors group"
                    >
                      <div className="col-span-12 md:col-span-7 flex items-center gap-4">
                        {getFileIcon(file.type)}
                        <span className="font-medium text-on-surface truncate">{file.name}</span>
                        <span className="px-2 py-0.5 bg-surface-container rounded-full text-[10px] font-bold text-on-surface-variant">
                          {file.type}
                        </span>
                      </div>
                      <div className="hidden md:block md:col-span-2 text-right font-mono text-sm text-on-surface-variant">
                        {file.size}
                      </div>
                      <div className="col-span-12 md:col-span-3 text-right">
                        <button 
                          onClick={() => downloadFile(file)}
                          className="md:opacity-0 group-hover:opacity-100 p-2 hover:bg-primary/10 rounded-full text-primary transition-all active:scale-90"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <div className="px-6 py-12 text-center text-on-surface-variant">
                      No se han encontrado archivos que coincidan con la búsqueda.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-surface-container-low border-t border-outline-variant py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-bold text-on-surface tracking-tight">UnzipIt</span>
            </div>
            <p className="text-on-surface-variant text-sm">© 2026 UnzipIt Utility. Rápido. Seguro. Transparente.</p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">API</a>
            <a href="#" className="hover:text-primary transition-colors">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

