package com.sales.miappweb.model;

import java.util.List;

public class Seccion {
    private String id;
    private String curso;
    private int creditos;         // Nuevo campo para controlar el tope de créditos
    private String codigoSeccion;
    private String profesor;
    private int prioridad;        // Lo asignará el usuario desde la web
    private List<BloqueHorario> horarios;

    public Seccion() {}

    public Seccion(String id, String curso, int creditos, String codigoSeccion, String profesor, List<BloqueHorario> horarios) {
        this.id = id;
        this.curso = curso;
        this.creditos = creditos;
        this.codigoSeccion = codigoSeccion;
        this.profesor = profesor;
        this.horarios = horarios;
    }

    public boolean esCompatibleCon(Seccion otra) {
        if (this.curso.equalsIgnoreCase(otra.curso)) return false;
        for (BloqueHorario b1 : this.horarios) {
            for (BloqueHorario b2 : otra.horarios) {
                if (b1.seCruzaCon(b2)) return false;
            }
        }
        return true;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
    public int getCreditos() { return creditos; }
    public void setCreditos(int creditos) { this.creditos = creditos; }
    public String getCodigoSeccion() { return codigoSeccion; }
    public void setCodigoSeccion(String codigoSeccion) { this.codigoSeccion = codigoSeccion; }
    public String getProfesor() { return profesor; }
    public void setProfesor(String profesor) { this.profesor = profesor; }
    public int getPrioridad() { return prioridad; }
    public void setPrioridad(int prioridad) { this.prioridad = prioridad; }
    public List<BloqueHorario> getHorarios() { return horarios; }
    public void setHorarios(List<BloqueHorario> horarios) { this.horarios = horarios; }
}