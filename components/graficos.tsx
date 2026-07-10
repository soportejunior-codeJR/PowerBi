'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Paleta de DATOS (subconjunto ROFÉ validado para marcas de datos; el azul de
// marca #406C9E se reserva para el chrome de la página).
export const C = {
  verde: '#6EA050',
  amarillo: '#EEC935',
  naranja: '#D1793F',
  rojo: '#C12D4C',
  azul2: '#6FA0BC',
  azul3: '#83B6DD',
};

export function abreviar(nombre: string, max = 26): string {
  const bonito = nombre
    .toLowerCase()
    .replace(/(^|[\s(])\p{L}/gu, (m) => m.toUpperCase());
  return bonito.length > max ? bonito.slice(0, max - 1) + '…' : bonito;
}

/** Barras apiladas horizontales por curso: completados / en progreso / sin iniciar. */
export function GraficoCursos({
  datos,
}: {
  datos: { curso: string; completados: number; en_progreso: number; sin_iniciar: number }[];
}) {
  const filas = datos.map((d) => ({ ...d, etiqueta: abreviar(d.curso) }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, filas.length * 44)}>
      <BarChart data={filas} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="etiqueta"
          width={190}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(v: number, nombre: string) => [v, nombre]}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.curso ?? ''}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="completados" name="Completados (>80%)" stackId="a" fill={C.verde} />
        <Bar dataKey="en_progreso" name="En progreso" stackId="a" fill={C.amarillo} />
        <Bar dataKey="sin_iniciar" name="Sin iniciar (0%)" stackId="a" fill={C.rojo} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Dona de situación de emprendimiento. */
export function GraficoEmprendimiento({
  datos,
}: {
  datos: { nombre: string; total: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={datos}
          dataKey="total"
          nameKey="nombre"
          innerRadius={60}
          outerRadius={110}
          paddingAngle={2}
        >
          {datos.map((d) => (
            <Cell key={d.nombre} fill={d.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Barras verticales genéricas (edades, cursos promedio por situación, etc.). */
export function GraficoBarras({
  datos,
  dataKey,
  nombre,
  color = C.azul2,
  etiquetaKey = 'etiqueta',
  alto = 280,
  dominioMax,
}: {
  datos: Record<string, unknown>[];
  dataKey: string;
  nombre: string;
  color?: string;
  etiquetaKey?: string;
  alto?: number;
  dominioMax?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={datos} margin={{ right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={etiquetaKey} tick={{ fontSize: 11 }} interval={0} />
        <YAxis
          tick={{ fontSize: 12 }}
          domain={dominioMax ? [0, dominioMax] : undefined}
        />
        <Tooltip />
        <Bar dataKey={dataKey} name={nombre} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Barras apiladas por grupo operativo: mujeres / hombres / otros. */
export function GraficoDemografia({
  datos,
}: {
  datos: { grupo_ciudad: string; mujeres: number; hombres: number; otros_genero: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={datos} margin={{ right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="grupo_ciudad" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="mujeres" name="Mujeres" stackId="g" fill={C.naranja} />
        <Bar dataKey="hombres" name="Hombres" stackId="g" fill={C.azul2} />
        <Bar dataKey="otros_genero" name="Otras identidades" stackId="g" fill={C.amarillo} />
      </BarChart>
    </ResponsiveContainer>
  );
}
