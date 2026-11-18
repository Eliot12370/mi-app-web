package com.sales.miappweb.service;

import com.sales.miappweb.model.BloqueHorario;
import com.sales.miappweb.model.Seccion;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CatalogoService {

    public List<Seccion> obtenerCatalogoCompleto() {
        List<Seccion> db = new ArrayList<>();

        // CURSO 1: Matemática Discreta (4 créditos) - 3 secciones
        db.add(new Seccion("MD-A", "Matemática Discreta", 4, "A", "Dr. Torres",
                Arrays.asList(new BloqueHorario("Lunes", 8, 10), new BloqueHorario("Miércoles", 8, 10))));
        db.add(new Seccion("MD-B", "Matemática Discreta", 4, "B", "Mg. Paredes",
                Arrays.asList(new BloqueHorario("Martes", 10, 12), new BloqueHorario("Jueves", 10, 12))));
        db.add(new Seccion("MD-C", "Matemática Discreta", 4, "C", "Dr. Huamán",
                List.of(new BloqueHorario("Viernes", 8, 12))));

        // CURSO 2: Programación Orientada a Objetos (4 créditos) - 3 secciones
        db.add(new Seccion("POO-A", "Programación Orientada a Objetos", 4, "A", "Ing. Quispe",
                Arrays.asList(new BloqueHorario("Lunes", 8, 10), new BloqueHorario("Viernes", 10, 12))));
        db.add(new Seccion("POO-B", "Programación Orientada a Objetos", 4, "B", "Ing. Mendoza",
                Arrays.asList(new BloqueHorario("Martes", 8, 10), new BloqueHorario("Jueves", 8, 10))));
        db.add(new Seccion("POO-C", "Programación Orientada a Objetos", 4, "C", "Mg. Salazar",
                List.of(new BloqueHorario("Miércoles", 14, 18))));

        // CURSO 3: Cálculo Multivariable (5 créditos) - 2 secciones
        db.add(new Seccion("CM-A", "Cálculo Multivariable", 5, "A", "Dr. Rojas",
                Arrays.asList(new BloqueHorario("Lunes", 10, 12), new BloqueHorario("Miércoles", 10, 12))));
        db.add(new Seccion("CM-B", "Cálculo Multivariable", 5, "B", "Dr. Silva",
                Arrays.asList(new BloqueHorario("Martes", 14, 16), new BloqueHorario("Jueves", 14, 16))));

        // CURSO 4: Física II (4 créditos) - 2 secciones
        db.add(new Seccion("FIS-A", "Física II", 4, "A", "Lic. Vargas",
                Arrays.asList(new BloqueHorario("Martes", 8, 10), new BloqueHorario("Viernes", 8, 10))));
        db.add(new Seccion("FIS-B", "Física II", 4, "B", "Dr. Chávez",
                Arrays.asList(new BloqueHorario("Lunes", 14, 16), new BloqueHorario("Jueves", 10, 12))));

        // CURSO 5: Base de Datos (3 créditos) - 2 secciones
        db.add(new Seccion("BD-A", "Base de Datos", 3, "A", "Ing. Castro",
                List.of(new BloqueHorario("Jueves", 16, 19))));
        db.add(new Seccion("BD-B", "Base de Datos", 3, "B", "Ing. Flores",
                List.of(new BloqueHorario("Sábado", 9, 12))));

        return db;
    }
}