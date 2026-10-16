# 🌍 T.E.G. La Revancha - Online

Implementación web multijugador completa de **T.E.G. La Revancha** (Yetem) diseñada para jugar con amigos desde cualquier navegador web (PC o celular), ya sea en tiempo real o por turnos asincrónicos.

---

## 🚀 Características Implementadas

1. **Tablero Oficial Completo:**
   - **72 Países** distribuidos en **7 Continentes** (*América del Norte, América Central, América del Sur, Europa, Asia, África y Oceanía*).
   - Conexiones y rutas terrestres y marítimas calculadas mediante grafos de adyacencia.
   - Banderas de islas para objetivos específicos.

2. **Mecánicas Tácticas de La Revancha:**
   - **Misiles Tácticos:** Cuestan 6 ejércitos (o canje de tropas), alcanzan objetivos a hasta 3 países de distancia o dentro del mismo continente, con daño escalonado (3, 2 o 1 baja) y capacidad de intercepción.
   - **Mazo de 50 Tarjetas de Situación:** *Combate clásico, Nieve (+1 dado defensor), Viento a favor (+1 dado atacante), Fronteras abiertas/cerradas, Crisis, Refuerzos extras y Descanso*.
   - **Combate con Dados en Vivo:** Animación de dados con reglas de desempate a favor del defensor y pase de tropas tras conquista.
   - **20 Objetivos Oficiales:** 19 objetivos secretos (conquista y destrucción) + Objetivo Común alternativo (ocupar 45 países).
   - **Canje de Tarjetas de Países:** 1º canje (6), 2º (10), 3º (15), 4º (+5), con combinaciones oficiales (3 iguales, 3 distintas o con comodín Soldado).

3. **Multijugador y Persistencia:**
   - Creación de salas privadas con un simple código o enlace para compartir con amigos por WhatsApp o Discord.
   - **Persistencia en disco (JSON):** Si alguien cierra la pestaña o se recarga la página, su token en `localStorage` le permite reconectarse instantáneamente sin perder su turno ni sus cartas.
   - Chat en tiempo real y registro histórico de jugadas bélicas.

---

## 🛠️ Cómo Ejecutarlo Localmente

1. Abrí una terminal en la carpeta del proyecto:
   ```bash
   cd C:\Users\Usuario\.gemini\antigravity\scratch\teg-revancha-web
   ```

2. Iniciá el servidor:
   ```bash
   npm start
   ```

3. Abrí tu navegador en:
   👉 **http://localhost:3000**

---

## 🌐 Cómo Publicarlo Online para tus Amigos (Gratis en 5 minutos)

Para que tus amigos puedan entrar desde sus casas sin que vos tengas que dejar tu PC prendida:

### Opción 1: Render (Recomendada y Gratuita)
1. Subí este proyecto a tu cuenta de **GitHub**.
2. Entrá en [render.com](https://render.com) y creá un **New Web Service**.
3. Conectá el repositorio y configurá:
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Render te dará un link gratuito (ej: `https://mi-teg.onrender.com`) que podés pasarle a tus amigos para jugar inmediatamente.

### Opción 2: ngrok / Localtunnel (Para jugar YA sin subir a ningún lado)
Si querés jugar hoy mismo desde tu PC:
```bash
npx localtunnel --port 3000
```
Te dará una URL pública que tus amigos pueden abrir directamente desde sus celulares o computadoras.
