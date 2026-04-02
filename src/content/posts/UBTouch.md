---
title: "Desarrollo Intermedio en Ubuntu Touch: Apps con QML y JS"
description: "Aprende a crear una aplicación funcional para UBports utilizando componentes nativos y lógica en JavaScript."
published: 2026-04-02
draft: true
author: "Valtic"
Image:
    url: "https://ubports.com/web/image/website/10/logo/UBports?unique=82d2d76"
    alt: "Logo de UBports"
tags: ['Ubuntu Touch', 'QML', 'JavaScript', 'UBports', 'Astro']
---

# Construyendo para el Futuro Móvil: Apps en Ubuntu Touch

Si ya sabes programar pero quieres dar el salto a la convergencia de **Ubuntu Touch**, este tutorial es para ti. No vamos a ver qué es una variable; vamos a construir una **aplicación de lista de tareas con persistencia de datos**.

## 1. El Entorno de Trabajo: Clickable

Para desarrollar en UBports, la herramienta indispensable es [Clickable](https://docs.ubports.com/es/latest/appdev/). Es un CLI que gestiona la compilación, el empaquetado y la ejecución en dispositivos o contenedores.



Tutorial para el aprendizaje de cracion de aplicaciones con QML+Js, para aplicaciones UbTouch.
Info: [UbPorts Tutorial](https://ubports.gitlab.io/marketing/education/ub-clickable-1/trainingpart1module1.html)

### Todas las atribuciones son para los creadores de UbPorts y sus asociados.
Este blog solo tiene el objetivo de la re-distribucion de la informacion para ampliar su base de usuarios.

## Resumen "manos a la obra" del Tutorial referenciado.

### 1. Instalación rápida
```bash
pip install clickable
```


### 2. Crear un nuevo proyecto

Bash

```
clickable create
```

Selecciona la plantilla **"QML Only"** y completa los datos solicitados.

### 3. Estructura de una App Nativa en Ubuntu Touch
----------------------

Una aplicación de Ubuntu Touch se basa principalmente en el framework **Qt 5** y los **Ubuntu Components**.

Los archivos y carpetas principales son:

- **`Main.qml`**: Punto de entrada de la interfaz gráfica.
- **`manifest.json`**: Metadatos de la aplicación (nombre, versión, icono, permisos, etc.).
- **`assets/`**: Carpeta para imágenes, iconos y otros recursos.

### 4. Bloque básico de interfaz (Main.qml)

```qml
import QtQuick 2.4
import Ubuntu.Components 1.3

MainView {
    objectName: "mainView"
    applicationName: "mytodoapp.tuusuario"

    width: units.gu(40)
    height: units.gu(60)

    Page {
        title: i18n.tr("Mis Tareas")

        Column {
            anchors.fill: parent
            spacing: units.gu(1)
            // Aquí irá nuestra lógica y componentes
        }
    }
}
```
### 5. Lógica con JavaScript
-------------------------

En QML, JavaScript no solo se usa para eventos, sino también como motor principal de la lógica de negocio. Para mantener el código limpio y mantenible, es recomendable separar la lógica en un archivo .js.

### Ejemplo: logic.js

```JavaScript
// logic.js
function addTask(model, text) {
    if (text.trim().length > 0) {
        model.append({
            "name": text.trim(),
            "done": false
        });
    }
}

function toggleTask(model, index) {
    const task = model.get(index);
    model.setProperty(index, "done", !task.done);
}
```

### 6. Integración en QML

```qml
import "logic.js" as Logic

Button {
    text: "Añadir Tarea"
    onClicked: Logic.addTask(taskModel, inputField.text)
}
```

### 7. Persistencia de datos con LocalStorage
------------------------------------------

Para que las tareas persistan después de cerrar la aplicación, puedes utilizar el módulo **LocalStorage** de QtQuick.

> **Nota**: Para proyectos más avanzados, consulta la documentación oficial de UBports sobre el **Content Hub** y el uso de bases de datos SQLite.

### 8. Pruebas y Despliegue
------------------------

La forma más sencilla de probar y desplegar tu aplicación es usando la herramienta **Clickable** instalda.

### 8.a. Test en el equipo de desarrollo

Conecta tu teléfono Ubuntu Touch con el **Modo Desarrollador** activado y ejecuta:

Bash

```
clickable desktop
```

### 8.b. Ejecutar en el dispositivo

Conecta tu teléfono Ubuntu Touch con el **Modo Desarrollador** activado y ejecuta:

Bash

```
clickable
```

Este comando compilará la aplicación, la enviará al dispositivo y la lanzará automáticamente.

## Recursos de Referencia
----------------------

-   [Documentación Oficial de UBports](https://docs.ubports.com)
-   [Curso de Qt - Mimecar GitBook](https://mimecar.gitbook.io/curso-de-programacion)
-   [Ejemplos de la Comunidad - UBports GitLab Education](https://gitlab.com/ubports/community-apps)
# Selecciona "QML Only" para este tutorial

