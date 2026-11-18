package com.sales.miappweb.controller;

import com.sales.miappweb.graph.GrafoCompatibilidad;
import com.sales.miappweb.model.Seccion;
import com.sales.miappweb.service.CatalogoService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    private final CatalogoService catalogoService;

    public HorarioController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping("/catalogo")
    public List<Seccion> listarCatalogo() {
        return catalogoService.obtenerCatalogoCompleto();
    }

    @PostMapping("/optimizar")
    public Map<String, Object> optimizarHorario(@RequestBody List<Seccion> secciones) {
        GrafoCompatibilidad grafo = new GrafoCompatibilidad(secciones);
        List<GrafoCompatibilidad.ResultadoClique> cliques = grafo.encontrarCliquesOptimos();

        List <Object> nodos =  new ArrayList<>();
        grafo.getVertices().forEach(v -> {
            Map<String, Object> nodo = new HashMap<>();
            nodo.put("id", v.getIndice());
            nodo.put("label", v.getSeccion().getCurso() + " (" + v.getSeccion().getCodigoSeccion() + ")");
            nodo.put("curso", v.getSeccion().getCurso());
            nodo.put("peso", v.getPeso());
            nodo.put("grado", grafo.getGrado(v.getIndice()));
            nodos.add(nodo);
        });

        List<int[]> aristas = new ArrayList<>();
        grafo.getListaAdyacencia().forEach((u, vecinos) -> {
            for (int v : vecinos) {
                if (u < v) aristas.add(new int[]{u, v});
            }
        });

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("nodos", nodos);
        respuesta.put("aristas", aristas);
        respuesta.put("horariosOrdenados", cliques);
        return respuesta;
    }
}