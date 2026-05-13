import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('app/dashboard/suscripciones/PlansManager.tsx', 'utf8');

c = c.replace(
  'Zap, Building2,\r\n} from "lucide-react";',
  'Zap, Building2, AlertCircle,\r\n} from "lucide-react";'
);

c = c.replace(
  'const [success, setSuccess] = useState<string | null>(null);',
  'const [success, setSuccess] = useState<string | null>(null);\r\n  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);'
);

const oldDelete = `  async function handleDelete(id: string) {\r\n    if (!confirm("\u00BFEliminar este plan? Los suscriptores existentes no ser\u00E1n afectados.")) return;\r\n    await deletePlan(id);\r\n    setPlans((prev) => prev.filter((p) => p.id !== id));\r\n  }`;
const newDelete = `  async function confirmDeletePlan() {\r\n    if (!deleteConfirmId) return;\r\n    await deletePlan(deleteConfirmId);\r\n    setPlans((prev) => prev.filter((p) => p.id !== deleteConfirmId));\r\n    setDeleteConfirmId(null);\r\n  }`;

c = c.replace(oldDelete, newDelete);

c = c.replace(
  '      onClick={() => handleDelete(plan.id)}',
  '      onClick={() => setDeleteConfirmId(plan.id)}'
);

const modalJSX = `\r\n\r\n      {deleteConfirmId && (\r\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">\r\n          <div className="bg-card rounded-xl border border-card-border shadow-xl p-6 max-w-sm w-full">\r\n            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">\r\n              <AlertCircle size={24} />\r\n            </div>\r\n            <h3 className="text-lg font-bold text-center text-foreground mb-2">\u00BFEliminar Plan?</h3>\r\n            <p className="text-sm text-center text-muted mb-6">\r\n              Los suscriptores existentes no ser\u00E1n afectados.\r\n            </p>\r\n            <div className="flex gap-3">\r\n              <button\r\n                onClick={() => setDeleteConfirmId(null)}\r\n                className="flex-1 px-4 py-2.5 rounded-lg border border-card-border text-sm font-bold text-muted hover:text-foreground transition-colors"\r\n              >\r\n                Cancelar\r\n              </button>\r\n              <button\r\n                onClick={confirmDeletePlan}\r\n                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"\r\n              >\r\n                <Trash2 size={14} /> Eliminar\r\n              </button>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      )}`;

c = c.replace('    </div>\r\n  );\r\n}', `    </div>${modalJSX}\r\n  );\r\n}`);

writeFileSync('app/dashboard/suscripciones/PlansManager.tsx', c, 'utf8');
console.log('Done. confirm() still present:', c.includes('confirm('));
