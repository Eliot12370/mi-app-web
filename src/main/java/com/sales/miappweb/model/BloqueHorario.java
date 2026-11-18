package com.sales.miappweb.model;

public class BloqueHorario {
    private String dia;       // Ej: "Lunes", "Miercoles"
    private int horaInicio;   // Ej: 8 (para 08:00)
    private int horaFin;      // Ej: 10 (para 10:00)

    public BloqueHorario() {}

    public BloqueHorario(String dia, int horaInicio, int horaFin) {
        this.dia = dia;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    // Dos bloques se cruzan si son el mismo día y sus intervalos [inicio, fin) se solapan
    public boolean seCruzaCon(BloqueHorario otro) {
        if (!this.dia.equalsIgnoreCase(otro.dia)) return false;
        return this.horaInicio < otro.horaFin && otro.horaInicio < this.horaFin;
    }

    public String getDia() { return dia; }
    public void setDia(String dia) { this.dia = dia; }
    public int getHoraInicio() { return horaInicio; }
    public void setHoraInicio(int horaInicio) { this.horaInicio = horaInicio; }
    public int getHoraFin() { return horaFin; }
    public void setHoraFin(int horaFin) { this.horaFin = horaFin; }
}