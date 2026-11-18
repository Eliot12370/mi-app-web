package com.sales.miappweb.graph;

import com.sales.miappweb.model.Seccion;

public class Vertice {
    private final int indice;
    private final Seccion seccion;
    private final int peso; // Calculado inversamente a la prioridad

    public Vertice(int indice, Seccion seccion, int peso) {
        this.indice = indice;
        this.seccion = seccion;
        this.peso = peso;
    }

    public int getIndice() { return indice; }
    public Seccion getSeccion() { return seccion; }
    public int getPeso() { return peso; }
}