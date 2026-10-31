# Fase 1 completada · P01

## Migraciones

Antes de aplicar cambios, se consultó el catálogo de Supabase: no existían `estudiantes`, `cortes`, `v_ultimo_corte` ni `_migrations`. Los objetos del login sí existían y se verificaron. El runner registró los archivos históricos del login sin volver a ejecutarlos y aplicó `0001_notas_tablas.sql` y `0002_notas_vista_seguridad.sql`.

La conexión usa `POSTGRES_URL_NON_POOLING` con SSL `rejectUnauthorized: false`. Se elimina el parámetro `sslmode` de la URL porque la configuración del proveedor lo interpretaba como verificación completa del certificado e invalidaba esa opción explícita.

## Salida de `npm.cmd run db:verificar`

```text
Existencia: estudiantes=sí, cortes=sí, v_ultimo_corte=sí
Filas estudiantes: 0
Filas cortes: 0
Restricciones:
  cortes.cortes_estudiante_id_fkey: FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE RESTRICT
  cortes.cortes_final_rango: CHECK (((examen_final >= (0)::numeric) AND (examen_final <= (5)::numeric)))
  cortes.cortes_parcial1_rango: CHECK (((parcial1 >= (0)::numeric) AND (parcial1 <= (5)::numeric)))
  cortes.cortes_parcial2_rango: CHECK (((parcial2 >= (0)::numeric) AND (parcial2 <= (5)::numeric)))
  cortes.cortes_pkey: PRIMARY KEY (id)
  cortes.cortes_promedio_rango: CHECK (((promedio >= (0)::numeric) AND (promedio <= (5)::numeric)))
  cortes.cortes_resultado_valido: CHECK (((resultado)::text = ANY ((ARRAY['Aprobó'::character varying, 'Perdió'::character varying])::text[])))
  estudiantes.estudiantes_nombre_minimo: CHECK ((char_length(btrim((nombre)::text)) >= 2))
  estudiantes.estudiantes_pkey: PRIMARY KEY (id)
Índice ux_estudiantes_nombre: CREATE UNIQUE INDEX ux_estudiantes_nombre ON public.estudiantes USING btree (lower(btrim((nombre)::text)))
RLS estudiantes: activo
RLS cortes: activo
OK: a) estudiante Verif Ana aceptado
OK: b) nombre duplicado (RN-02) rechazado con 23505 (ux_estudiantes_nombre)
OK: c) nombre en blanco (RN-01) rechazado con 23514 (estudiantes_nombre_minimo)
OK: d) parcial1 fuera de rango (RN-03) rechazado con 23514 (cortes_parcial1_rango)
OK: e) examen_final fuera de rango rechazado con 23514 (cortes_final_rango)
OK: f) resultado inválido rechazado con 23514 (cortes_resultado_valido)
OK: g) v_ultimo_corte devuelve el segundo corte
Transacción de pruebas: ROLLBACK completado
Total de fallas: 0
```

## Validación de build

`npm.cmd run build`: correcto. Compilación, TypeScript, generación de páginas y optimización de producción completaron sin errores.

## Pendiente de integración

El login conserva sus redirecciones actuales (`/usuarios` y `/dashboard`) mientras `/notas` no exista; no se redirige a una ruta inexistente.
