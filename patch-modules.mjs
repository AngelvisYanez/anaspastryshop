import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('app/dashboard/modulos/PlatformModuleManager.tsx', 'utf8');

// Add AlertCircle to imports
c = c.replace(
  '  Eye, EyeOff, Pencil, X, Save,\n} from "lucide-react";',
  '  Eye, EyeOff, Pencil, X, Save, AlertCircle,\n} from "lucide-react";'
);

// Wrap return in fragment to allow modal sibling
c = c.replace(
  'return (\n    <div className="max-w-5xl">',
  'return (\n    <>\n    <div className="max-w-5xl">'
);

// Add modal and close fragment at the end
const lastClose = '    </div>\n  );\n}';
const modalAndClose = [
  '    </div>',
  '',
  '      {deleteConfirmId && (',
  '        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">',
  '          <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-sm w-full">',
  '            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">',
  '              <AlertCircle size={24} />',
  '            </div>',
  '            <h3 className="text-lg font-bold text-center text-foreground mb-2">\u00BFEliminar M\u00F3dulo?</h3>',
  '            <p className="text-sm text-center text-muted mb-6">',
  '              Esta acci\u00F3n no se puede deshacer.',
  '            </p>',
  '            <div className="flex gap-3">',
  '              <button',
  '                onClick={() => setDeleteConfirmId(null)}',
  '                className="flex-1 px-4 py-2.5 rounded-lg border border-card-border text-sm font-bold text-muted hover:text-foreground transition-colors"',
  '              >',
  '                Cancelar',
  '              </button>',
  '              <button',
  '                onClick={confirmDeleteModule}',
  '                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"',
  '              >',
  '                <Trash2 size={14} /> Eliminar',
  '              </button>',
  '            </div>',
  '          </div>',
  '        </div>',
  '      )}',
  '    </>',
  '  );',
  '}',
].join('\n');

const lastIdx = c.lastIndexOf(lastClose);
if (lastIdx === -1) {
  console.log('ERROR: closing pattern not found');
  process.exit(1);
}
c = c.substring(0, lastIdx) + modalAndClose + c.substring(lastIdx + lastClose.length);

writeFileSync('app/dashboard/modulos/PlatformModuleManager.tsx', c, 'utf8');
console.log('confirm():', c.includes('confirm('));
console.log('AlertCircle:', c.includes('AlertCircle'));
console.log('deleteConfirmId:', c.includes('deleteConfirmId'));
console.log('modal JSX:', c.includes('confirmDeleteModule'));
