package com.sales.miappweb.graph;

import com.sales.miappweb.model.Seccion;
import java.util.*;

public class GrafoCompatibilidad {
    private final List<Vertice> vertices;
    private final Map<Integer, Set<Integer>> listaAdyacencia; // Estructuras puras de grafos
    private final int numParticionesK; // Cantidad de cursos distintos elegidos

    public GrafoCompatibilidad(List<Seccion> seccionesSeleccionadas) {
        this.vertices = new ArrayList<>();
        this.listaAdyacencia = new HashMap<>();

        Set<String> cursosUnicos = new HashSet<>();
        for (int i = 0; i < seccionesSeleccionadas.size(); i++) {
            Seccion s = seccionesSeleccionadas.get(i);
            cursosUnicos.add(s.getCurso());
            // Transformamos prioridad (1, 2, 3...) en peso positivo (ej. 1000, 900, 800...)
            int peso = Math.max(10, 1100 - (s.getPrioridad() * 100));
            vertices.add(new Vertice(i, s, peso));
            listaAdyacencia.put(i, new HashSet<>());
        }
        this.numParticionesK = cursosUnicos.size();
        construirAristas();
    }

    private void construirAristas() {
        int n = vertices.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Seccion s1 = vertices.get(i).getSeccion();
                Seccion s2 = vertices.get(j).getSeccion();
                if (s1.esCompatibleCon(s2)) {
                    // Grafo no dirigido: arista bidireccional
                    listaAdyacencia.get(i).add(j);
                    listaAdyacencia.get(j).add(i);
                }
            }
        }
    }

    // PROPIEDAD DE GRAFOS: Grado de un vértice deg(v)
    public int getGrado(int indiceVertice) {
        return listaAdyacencia.get(indiceVertice).size();
    }

    // ALGORITMO DE TEORÍA DE GRAFOS: Búsqueda de Cliques de tamaño K ordenados por peso
    public List<ResultadoClique> encontrarCliquesOptimos() {
        // Max-Heap para ordenar los subgrafos completos (Cliques) de mayor a menor peso total
        PriorityQueue<ResultadoClique> maxHeap = new PriorityQueue<>(
                (a, b) -> Integer.compare(b.pesoTotal, a.pesoTotal)
        );

        // Poda previa por Teoría de Grafos: descartar vértices con grado < K - 1
        List<Integer> candidatosValidos = new ArrayList<>();
        for (Vertice v : vertices) {
            if (getGrado(v.getIndice()) >= numParticionesK - 1) {
                candidatosValidos.add(v.getIndice());
            }
        }

        buscarCliquesRecursivo(new ArrayList<>(), candidatosValidos, 0, 0, maxHeap);

        List<ResultadoClique> ranking = new ArrayList<>();
        while (!maxHeap.isEmpty()) {
            ranking.add(maxHeap.poll());
        }
        return ranking;
    }

    private void buscarCliquesRecursivo(List<Integer> cliqueActual, List<Integer> candidatos,
                                        int inicio, int pesoAcumulado, PriorityQueue<ResultadoClique> maxHeap) {
        // Caso base: Hemos formado un subgrafo completo K_n (un curso por cada partición)
        if (cliqueActual.size() == numParticionesK) {
            List<Seccion> secciones = new ArrayList<>();
            for (int idx : cliqueActual) {
                secciones.add(vertices.get(idx).getSeccion());
            }
            maxHeap.add(new ResultadoClique(secciones, pesoAcumulado));
            return;
        }

        for (int i = inicio; i < candidatos.size(); i++) {
            int v = candidatos.get(i);
            // Verificar propiedad de Clique: 'v' debe ser adyacente a TODOS los vértices ya en cliqueActual
            if (esAdyacenteATodos(v, cliqueActual)) {
                cliqueActual.add(v);
                buscarCliquesRecursivo(cliqueActual, candidatos, i + 1,
                        pesoAcumulado + vertices.get(v).getPeso(), maxHeap);
                cliqueActual.remove(cliqueActual.size() - 1);
            }
        }
    }

    private boolean esAdyacenteATodos(int v, List<Integer> subgrafo) {
        Set<Integer> vecinosDeV = listaAdyacencia.get(v);
        for (int u : subgrafo) {
            if (!vecinosDeV.contains(u)) return false;
        }
        return true;
    }

    public List<Vertice> getVertices() { return vertices; }
    public Map<Integer, Set<Integer>> getListaAdyacencia() { return listaAdyacencia; }

    public static class ResultadoClique {
        public List<Seccion> secciones;
        public int pesoTotal;

        public ResultadoClique(List<Seccion> secciones, int pesoTotal) {
            this.secciones = secciones;
            this.pesoTotal = pesoTotal;
        }
    }
}