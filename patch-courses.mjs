import { readFileSync, writeFileSync } from 'fs';

const R = '\r\n';

// ─── 1. CourseCreateClient.tsx ─────────────────────────────────────────────
{
  const p = 'app/dashboard/cursos/create/CourseCreateClient.tsx';
  let c = readFileSync(p, 'utf8');

  // Pass status/publishedAt in createCourse call (only if not already patched)
  if (!c.includes('status,')) {
    c = c.replace(
      `      liveUrl: isLive ? liveUrl : undefined,${R}      instructorId: isAdmin ? instructorId : undefined,`,
      `      liveUrl: isLive ? liveUrl : undefined,${R}      status,${R}      publishedAt: status === "SCHEDULED" ? publishedAt : undefined,${R}      instructorId: isAdmin ? instructorId : undefined,`
    );
    console.log('create: patched createCourse call');
  }

  // Replace submit button with publishing section
  const OLD_BTN = `    <div className="flex justify-end pt-6">${R}          <button${R}            type="submit"${R}            disabled={loading}${R}            className="bg-[#0B1F3A] text-white px-8 py-4 rounded-lg font-black text-lg shadow-xl shadow-gray-200 hover:bg-accent hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-3"${R}          >${R}            {loading ? <Loader2 size={24} className="animate-spin" /> : null}${R}            Publicar Curso${R}          </button>${R}        </div>`;

  if (c.includes(OLD_BTN)) {
    const NEW_SECTION = `        {/* PARTE 4: Publicaci\u00f3n */}${R}        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm">${R}          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">${R}            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">4</span>${R}            Publicaci\u00f3n${R}          </h2>${R}          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">${R}            <button${R}              type="button"${R}              onClick={() => setStatus("DRAFT")}${R}              className={\`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all \${status === "DRAFT" ? "border-gray-400 bg-gray-50 text-gray-700" : "border-card-border bg-section-alt text-muted hover:border-gray-300"}\`}${R}            >${R}              <FileText size={20} />${R}              Borrador${R}              <span className="text-[10px] font-normal text-muted">No visible p\u00fablicamente</span>${R}            </button>${R}            <button${R}              type="button"${R}              onClick={() => setStatus("PUBLISHED")}${R}              className={\`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all \${status === "PUBLISHED" ? "border-green-500 bg-green-50 text-green-700" : "border-card-border bg-section-alt text-muted hover:border-green-300"}\`}${R}            >${R}              <Globe size={20} />${R}              Publicar ahora${R}              <span className="text-[10px] font-normal text-muted">Visible inmediatamente</span>${R}            </button>${R}            <button${R}              type="button"${R}              onClick={() => setStatus("SCHEDULED")}${R}              className={\`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all \${status === "SCHEDULED" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-card-border bg-section-alt text-muted hover:border-blue-300"}\`}${R}            >${R}              <Calendar size={20} />${R}              Programar${R}              <span className="text-[10px] font-normal text-muted">Publicaci\u00f3n autom\u00e1tica</span>${R}            </button>${R}          </div>${R}          {status === "SCHEDULED" && (${R}            <div className="mt-2">${R}              <label className="block text-sm font-bold text-foreground mb-2">Fecha y hora de publicaci\u00f3n</label>${R}              <input${R}                required${R}                type="datetime-local"${R}                value={publishedAt}${R}                onChange={e => setPublishedAt(e.target.value)}${R}                min={new Date().toISOString().slice(0, 16)}${R}                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground"${R}              />${R}              <p className="text-xs text-muted mt-2 font-medium">El curso se publicar\u00e1 autom\u00e1ticamente en esa fecha y hora.</p>${R}            </div>${R}          )}${R}        </div>${R}${R}        <div className="flex justify-end pt-6">${R}          <button${R}            type="submit"${R}            disabled={loading || (status === "SCHEDULED" && !publishedAt)}${R}            className="bg-[#0B1F3A] text-white px-8 py-4 rounded-lg font-black text-lg shadow-xl shadow-gray-200 hover:bg-accent hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-3"${R}          >${R}            {loading ? <Loader2 size={24} className="animate-spin" /> : null}${R}            {status === "DRAFT" ? "Guardar Borrador" : status === "SCHEDULED" ? "Programar Publicaci\u00f3n" : "Publicar Curso"}${R}          </button>${R}        </div>`;

    c = c.replace(OLD_BTN, NEW_SECTION);
    console.log('create: patched submit button');
  } else {
    console.log('create: submit button not found, checking content...');
    const idx = c.indexOf('Publicar Curso');
    console.log('Publicar Curso at:', idx);
    if (idx > 0) console.log(JSON.stringify(c.slice(idx - 300, idx + 50)));
  }

  writeFileSync(p, c, 'utf8');
  console.log('CourseCreateClient.tsx done');
}

// ─── 2. CourseEditClient.tsx ───────────────────────────────────────────────
{
  const p = 'app/dashboard/cursos/[id]/edit/CourseEditClient.tsx';
  let c = readFileSync(p, 'utf8');

  // Add status imports if not already there
  if (!c.includes('FileText')) {
    c = c.replace(
      'import { Plus, Trash2, Video, ArrowLeft, Loader2, AlignLeft, ChevronDown, AlertCircle } from "lucide-react";',
      'import { Plus, Trash2, Video, ArrowLeft, Loader2, AlignLeft, ChevronDown, AlertCircle, FileText, Globe, Calendar } from "lucide-react";'
    );
    console.log('edit: patched imports');
  }

  // Add status state vars if not already there
  if (!c.includes('setStatus')) {
    c = c.replace(
      `  // M\u00f3dulos con Sus Tareas${R}  const initialModules`,
      `  // Publicaci\u00f3n${R}  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">((course.status as "DRAFT" | "PUBLISHED" | "SCHEDULED") || "PUBLISHED");${R}  const [publishedAt, setPublishedAt] = useState(${R}    course.publishedAt ? new Date(course.publishedAt).toISOString().slice(0, 16) : ""${R}  );${R}${R}  // M\u00f3dulos con Sus Tareas${R}  const initialModules`
    );
    console.log('edit: patched state vars');
  }

  // Pass status/publishedAt in updateCourse call
  if (!c.includes('status,')) {
    c = c.replace(
      `      liveUrl: isLive ? liveUrl : undefined,${R}      instructorId: isAdmin ? instructorId : undefined,`,
      `      liveUrl: isLive ? liveUrl : undefined,${R}      status,${R}      publishedAt: status === "SCHEDULED" ? publishedAt : undefined,${R}      instructorId: isAdmin ? instructorId : undefined,`
    );
    console.log('edit: patched updateCourse call');
  }

  // Find and replace the submit button
  const OLD_BTN = `    <div className="flex justify-end pt-6">${R}          <button${R}            type="submit"${R}            disabled={loading}${R}            className="bg-accent text-white px-8 py-4 rounded-lg font-black text-lg shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-3"${R}          >${R}            {loading ? <Loader2 size={24} className="animate-spin" /> : null}${R}            Guardar Cambios${R}          </button>${R}        </div>`;

  if (c.includes(OLD_BTN)) {
    const NEW_SECTION = `        {/* PARTE 4: Publicaci\u00f3n */}${R}        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm">${R}          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">${R}            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">4</span>${R}            Publicaci\u00f3n${R}          </h2>${R}          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">${R}            <button${R}              type="button"${R}              onClick={() => setStatus("DRAFT")}${R}              className={\`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all \${status === "DRAFT" ? "border-gray-400 bg-gray-50 text-gray-700" : "border-card-border bg-section-alt text-muted hover:border-gray-300"}\`}${R}            >${R}              <FileText size={20} />${R}              Borrador${R}              <span className="text-[10px] font-normal text-muted">No visible p\u00fablicamente</span>${R}            </button>${R}            <button${R}              type="button"${R}              onClick={() => setStatus("PUBLISHED")}${R}              className={\`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all \${status === "PUBLISHED" ? "border-green-500 bg-green-50 text-green-700" : "border-card-border bg-section-alt text-muted hover:border-green-300"}\`}${R}            >${R}              <Globe size={20} />${R}              Publicar ahora${R}              <span className="text-[10px] font-normal text-muted">Visible inmediatamente</span>${R}            </button>${R}            <button${R}              type="button"${R}              onClick={() => setStatus("SCHEDULED")}${R}              className={\`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all \${status === "SCHEDULED" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-card-border bg-section-alt text-muted hover:border-blue-300"}\`}${R}            >${R}              <Calendar size={20} />${R}              Programar${R}              <span className="text-[10px] font-normal text-muted">Publicaci\u00f3n autom\u00e1tica</span>${R}            </button>${R}          </div>${R}          {status === "SCHEDULED" && (${R}            <div className="mt-2">${R}              <label className="block text-sm font-bold text-foreground mb-2">Fecha y hora de publicaci\u00f3n</label>${R}              <input${R}                required${R}                type="datetime-local"${R}                value={publishedAt}${R}                onChange={e => setPublishedAt(e.target.value)}${R}                min={new Date().toISOString().slice(0, 16)}${R}                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground"${R}              />${R}              <p className="text-xs text-muted mt-2 font-medium">El curso se publicar\u00e1 autom\u00e1ticamente en esa fecha y hora.</p>${R}            </div>${R}          )}${R}        </div>${R}${R}        <div className="flex justify-end pt-6">${R}          <button${R}            type="submit"${R}            disabled={loading || (status === "SCHEDULED" && !publishedAt)}${R}            className="bg-accent text-white px-8 py-4 rounded-lg font-black text-lg shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-3"${R}          >${R}            {loading ? <Loader2 size={24} className="animate-spin" /> : null}${R}            {status === "DRAFT" ? "Guardar Borrador" : status === "SCHEDULED" ? "Guardar y Programar" : "Guardar Cambios"}${R}          </button>${R}        </div>`;

    c = c.replace(OLD_BTN, NEW_SECTION);
    console.log('edit: patched submit button');
  } else {
    console.log('edit: submit button not found');
    const idx = c.indexOf('Guardar Cambios');
    if (idx > 0) console.log(JSON.stringify(c.slice(idx - 300, idx + 50)));
  }

  writeFileSync(p, c, 'utf8');
  console.log('CourseEditClient.tsx done');
}
