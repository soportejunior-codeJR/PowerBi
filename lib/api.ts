// Cliente mínimo de las vistas públicas de Supabase (solo agregados, sin PII).
// El anon key es público por diseño: RLS solo deja leer agregados y las vistas v_*.
// Overridable por env en build (NEXT_PUBLIC_*) — defaults del proyecto panel-datos-rofe.

const URL_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://kbxptoowtnteflhrfwid.supabase.co';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHB0b293dG50ZWZsaHJmd2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MzU4MDUsImV4cCI6MjA5OTIxMTgwNX0.xfj_GJYdRgPHUCpyxReKm7G7SMGTVn4oscDhakV6DSo';

async function leer<T>(recurso: string): Promise<T[]> {
  const resp = await fetch(`${URL_BASE}/rest/v1/${recurso}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!resp.ok) throw new Error(`Supabase ${recurso}: HTTP ${resp.status}`);
  return resp.json();
}

export interface CohorteStats {
  cohorte: string;
  total_participantes: number;
  con_emprendimiento: number;
  sin_emprendimiento: number;
  porcentaje_con_emprendimiento: string | null;
  edad_promedio: string | null;
  computed_at: string;
}

export interface CursoCompletion {
  curso: string;
  cohorte: string;
  matriculados: number;
  completados: number;
  en_progreso: number;
  sin_iniciar: number;
  pct_completados: string | null;
  promedio_avance: string | null;
  programa: 'jc' | 'mr' | 'stand' | null;
}

export interface ProgramaStats {
  programa: 'jc' | 'mr' | 'stand';
  participantes: number;
  matriculas: number;
  completadas: number;
  promedio_avance: string | null;
  cohorte: string;
}

export interface HistorialCurso {
  fecha: string;
  curso: string;
  programa: 'jc' | 'mr' | 'stand' | null;
  matriculados: number;
  promedio_avance: string | null;
  completados: number | null;
  fuente: string;
}

export interface DemografiaGrupo {
  grupo_ciudad: string;
  total: number;
  edad_promedio: string | null;
  mujeres: number;
  hombres: number;
  otros_genero: number;
}

export interface EmprendimientoSituacion {
  situacion: string;
  total: number;
}

export interface EmprendimientoVsCursos {
  situacion: string;
  participantes: number;
  prom_cursos_completados: string | null;
  prom_avance: string | null;
}

export interface EdadDistribucion {
  rango: string;
  orden: number;
  total: number;
}

export interface Datos {
  cohorte: CohorteStats[];
  cursos: CursoCompletion[];
  demografia: DemografiaGrupo[];
  emprendimiento: EmprendimientoSituacion[];
  empVsCursos: EmprendimientoVsCursos[];
  edades: EdadDistribucion[];
  programas: ProgramaStats[];
  historial: HistorialCurso[];
}

export async function cargarTodo(): Promise<Datos> {
  const [cohorte, cursos, demografia, emprendimiento, empVsCursos, edades, programas, historial] =
    await Promise.all([
      leer<CohorteStats>('cohorte_stats'),
      leer<CursoCompletion>('v_curso_completion?order=matriculados.desc'),
      leer<DemografiaGrupo>('v_demografia_grupo?order=total.desc'),
      leer<EmprendimientoSituacion>('v_emprendimiento_situacion'),
      leer<EmprendimientoVsCursos>('v_emprendimiento_vs_cursos'),
      leer<EdadDistribucion>('v_edad_distribucion?order=orden.asc'),
      leer<ProgramaStats>('v_programa_stats'),
      leer<HistorialCurso>('historial_cursos?order=fecha.asc&limit=5000'),
    ]);
  return { cohorte, cursos, demografia, emprendimiento, empVsCursos, edades, programas, historial };
}

export const NOMBRE_PROGRAMA: Record<string, string> = {
  jc: 'Jóvenes creaTIvos',
  mr: 'Mujeres ROFÉ',
};

export const ETIQUETA_SITUACION: Record<string, string> = {
  en_marcha: 'Emprendimiento en marcha',
  idea: 'Tiene una idea de negocio',
  interesado: 'Le interesa emprender',
  no_interesado: 'Prefiere buscar empleo',
};

export const ORDEN_SITUACION = ['en_marcha', 'idea', 'interesado', 'no_interesado'];
