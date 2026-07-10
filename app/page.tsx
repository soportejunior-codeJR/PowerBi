'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  cargarTodo,
  Datos,
  ETIQUETA_SITUACION,
  ORDEN_SITUACION,
} from '@/lib/api';
import {
  C,
  GraficoBarras,
  GraficoCursos,
  GraficoDemografia,
  GraficoEmprendimiento,
} from '@/components/graficos';

const TABS = ['Resumen', 'Cursos', 'Emprendimiento', 'Demografía'] as const;
type Tab = (typeof TABS)[number];

const COLOR_SITUACION: Record<string, string> = {
  en_marcha: C.verde,
  idea: C.azul2,
  interesado: C.amarillo,
  no_interesado: C.naranja,
};

function Kpi({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="text-3xl font-bold text-rofe-azul mt-1">{valor}</p>
      {detalle && <p className="text-xs text-slate-400 mt-1">{detalle}</p>}
    </div>
  );
}

function Seccion({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
      <h2 className="font-bold text-slate-700 mb-1">{titulo}</h2>
      {nota && <p className="text-xs text-slate-400 mb-3">{nota}</p>}
      {children}
    </section>
  );
}

export default function Pagina() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('Resumen');

  useEffect(() => {
    cargarTodo().then(setDatos).catch((e) => setError(String(e)));
  }, []);

  const kpis = useMemo(() => {
    if (!datos) return null;
    const co = datos.cohorte[0];
    const matriculas = datos.cursos.reduce((s, c) => s + c.matriculados, 0);
    const completadas = datos.cursos.reduce((s, c) => s + c.completados, 0);
    const emp = datos.emprendimiento.find((e) => e.situacion === 'en_marcha')?.total ?? 0;
    return {
      participantes: co?.total_participantes ?? 0,
      cohorte: co?.cohorte ?? '—',
      matriculas,
      pctCompletadas: matriculas ? Math.round((100 * completadas) / matriculas) : 0,
      edadProm: co?.edad_promedio ? Number(co.edad_promedio).toFixed(1) : '—',
      empMarcha: emp,
    };
  }, [datos]);

  if (error)
    return (
      <div className="bg-rofe-rojo/10 border border-rofe-rojo text-rofe-rojo rounded-xl p-6">
        <p className="font-bold">No se pudieron cargar los datos.</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-sm mt-2">Intenta recargar la página en unos minutos.</p>
      </div>
    );

  if (!datos || !kpis)
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-xl" />
      </div>
    );

  const emprendimientoOrdenado = ORDEN_SITUACION.map((s) => {
    const fila = datos.emprendimiento.find((e) => e.situacion === s);
    return {
      nombre: ETIQUETA_SITUACION[s],
      total: fila?.total ?? 0,
      color: COLOR_SITUACION[s],
    };
  });

  const empVsCursos = ORDEN_SITUACION.map((s) => {
    const fila = datos.empVsCursos.find((e) => e.situacion === s);
    return {
      etiqueta: ETIQUETA_SITUACION[s].replace('Emprendimiento ', '').replace('Tiene una ', ''),
      cursos: fila ? Number(fila.prom_cursos_completados) : 0,
      participantes: fila?.participantes ?? 0,
    };
  });

  return (
    <div>
      {/* Tabs */}
      <nav className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-rofe-azul text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Resumen' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Kpi titulo={`Participantes ${kpis.cohorte}`} valor={String(kpis.participantes)} detalle="Cohorte activa (JC + Mujeres ROFÉ)" />
            <Kpi titulo="Matrículas" valor={String(kpis.matriculas)} detalle={`${kpis.pctCompletadas}% completadas (>80% avance)`} />
            <Kpi titulo="Edad promedio" valor={kpis.edadProm} detalle="Participantes con dato demográfico" />
            <Kpi titulo="Emprendimientos en marcha" valor={String(kpis.empMarcha)} detalle="Según encuesta de diagnóstico" />
          </div>
          <Seccion
            titulo="Completación por curso"
            nota="Completado = avance > 80% (mismo criterio del panel de aprobación)."
          >
            <GraficoCursos datos={datos.cursos} />
          </Seccion>
        </>
      )}

      {tab === 'Cursos' && (
        <>
          <Seccion titulo="Completación por curso" nota="Completado = avance > 80%.">
            <GraficoCursos datos={datos.cursos} />
          </Seccion>
          <Seccion titulo="Detalle por curso">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4">Curso</th>
                    <th className="py-2 pr-4 text-right">Matriculados</th>
                    <th className="py-2 pr-4 text-right">Completados</th>
                    <th className="py-2 pr-4 text-right">% Completados</th>
                    <th className="py-2 text-right">Avance promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.cursos.map((c) => (
                    <tr key={c.curso} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{c.curso}</td>
                      <td className="py-2 pr-4 text-right">{c.matriculados}</td>
                      <td className="py-2 pr-4 text-right">{c.completados}</td>
                      <td className="py-2 pr-4 text-right font-medium">
                        {c.pct_completados ?? '—'}%
                      </td>
                      <td className="py-2 text-right">{c.promedio_avance ?? '—'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Seccion>
        </>
      )}

      {tab === 'Emprendimiento' && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Seccion titulo="Situación frente al emprendimiento" nota="Encuesta de diagnóstico (696 respuestas).">
              <GraficoEmprendimiento datos={emprendimientoOrdenado} />
            </Seccion>
            <Seccion
              titulo="Cursos completados según situación"
              nota="Promedio de cursos completados por participante en cada grupo."
            >
              <GraficoBarras datos={empVsCursos} dataKey="cursos" nombre="Cursos completados (prom.)" color={C.verde} dominioMax={9} />
              <p className="text-xs text-slate-400 mt-2">
                Los cuatro grupos avanzan de forma pareja: tener (o no) un emprendimiento
                no cambia el ritmo en la ruta de cursos.
              </p>
            </Seccion>
          </div>
        </>
      )}

      {tab === 'Demografía' && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Seccion titulo="Participantes por grupo" nota="Grupos operativos por ciudad.">
              <GraficoBarras
                datos={datos.demografia.map((d) => ({ etiqueta: d.grupo_ciudad, total: d.total }))}
                dataKey="total"
                nombre="Participantes"
                color={C.azul2}
              />
            </Seccion>
            <Seccion titulo="Género por grupo">
              <GraficoDemografia datos={datos.demografia} />
            </Seccion>
          </div>
          <Seccion titulo="Distribución de edad" nota="En rangos — nunca edades individuales.">
            <GraficoBarras
              datos={datos.edades.map((e) => ({ etiqueta: e.rango, total: e.total }))}
              dataKey="total"
              nombre="Participantes"
              color={C.naranja}
            />
          </Seccion>
        </>
      )}
    </div>
  );
}
