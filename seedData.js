const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Article = require('./models/Article');
const Comment = require('./models/Comment');

/**
 * Script para insertar datos de prueba en la base de datos
 * Ejecutar con: node seedData.js
 */

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  }
};

const sampleArticles = [
  {
    title: "Introducción a Node.js y Express",
    slug: "introduccion-nodejs-express",
    content: `Node.js es un entorno de ejecución de JavaScript del lado del servidor que permite construir aplicaciones web escalables y eficientes. Express es un framework web minimalista y flexible para Node.js que proporciona un conjunto robusto de características para aplicaciones web y móviles.

En este artículo exploraremos los conceptos fundamentales de Node.js y Express, incluyendo:

## Características principales de Node.js
- **Asíncrono y orientado a eventos**: Node.js utiliza un modelo de E/S sin bloqueo
- **JavaScript en el servidor**: Permite usar JavaScript tanto en frontend como backend
- **NPM**: Gestor de paquetes más grande del mundo
- **Alto rendimiento**: Construido sobre el motor V8 de Google Chrome

## Ventajas de Express
- **Minimalista**: Framework ligero y flexible
- **Middleware**: Sistema de middleware extensible
- **Routing**: Sistema de enrutamiento robusto
- **Template engines**: Soporte para múltiples motores de plantillas

## Casos de uso comunes
- APIs REST
- Aplicaciones web en tiempo real
- Microservicios
- Herramientas de línea de comandos

Node.js y Express forman una combinación poderosa para el desarrollo de aplicaciones web modernas.`,
    author: "Profesor Arquitectura Web",
    tags: ["nodejs", "express", "javascript", "backend", "api"],
    likesCount: 15,
    viewsCount: 120
  },
  {
    title: "MongoDB: Base de Datos NoSQL para Aplicaciones Web",
    slug: "mongodb-nosql-aplicaciones-web",
    content: `MongoDB es una base de datos NoSQL orientada a documentos que almacena datos en formato BSON (Binary JSON). Es especialmente útil para aplicaciones web modernas que requieren flexibilidad y escalabilidad.

## ¿Qué es MongoDB?
MongoDB es una base de datos NoSQL que almacena datos en documentos flexibles similares a JSON. A diferencia de las bases de datos relacionales tradicionales, MongoDB no requiere un esquema fijo.

## Características principales
- **Documentos flexibles**: Almacena datos en documentos BSON
- **Escalabilidad horizontal**: Fácil escalado mediante sharding
- **Índices**: Sistema de índices potente para consultas rápidas
- **Agregación**: Pipeline de agregación para análisis complejos
- **Replicación**: Alta disponibilidad con réplicas

## Ventajas para aplicaciones web
- **Desarrollo rápido**: Sin esquemas rígidos
- **Escalabilidad**: Manejo eficiente de grandes volúmenes de datos
- **Flexibilidad**: Cambios de esquema sin migraciones complejas
- **Rendimiento**: Optimizado para lectura y escritura

## Casos de uso ideales
- Sistemas de gestión de contenido
- Aplicaciones de e-commerce
- Análisis de datos en tiempo real
- APIs REST con datos complejos

MongoDB es una excelente opción para aplicaciones web modernas que requieren flexibilidad y rendimiento.`,
    author: "Ingeniero de Software",
    tags: ["mongodb", "nosql", "base-datos", "backend", "escalabilidad"],
    likesCount: 23,
    viewsCount: 180
  },
  {
    title: "Arquitectura de APIs REST: Mejores Prácticas",
    slug: "arquitectura-apis-rest-mejores-practicas",
    content: `Las APIs REST (Representational State Transfer) son fundamentales en el desarrollo web moderno. Una arquitectura bien diseñada puede hacer la diferencia entre una API exitosa y una que cause problemas de mantenimiento.

## Principios fundamentales de REST
- **Stateless**: Cada solicitud debe contener toda la información necesaria
- **Client-Server**: Separación clara entre cliente y servidor
- **Cacheable**: Las respuestas deben ser cacheables cuando sea apropiado
- **Uniform Interface**: Interfaz consistente para todas las interacciones
- **Layered System**: Arquitectura en capas para escalabilidad

## Diseño de endpoints
### Convenciones de URL
- Usar sustantivos, no verbos
- Usar plurales para colecciones
- Mantener jerarquía lógica
- Evitar caracteres especiales

### Métodos HTTP
- **GET**: Obtener recursos
- **POST**: Crear nuevos recursos
- **PUT**: Actualizar recursos completos
- **PATCH**: Actualizaciones parciales
- **DELETE**: Eliminar recursos

## Mejores prácticas
- **Versionado**: Usar versiones en la URL o headers
- **Paginación**: Implementar paginación para listas grandes
- **Filtrado**: Permitir filtros en consultas
- **Ordenamiento**: Soporte para ordenamiento de resultados
- **Manejo de errores**: Códigos de estado HTTP apropiados
- **Documentación**: Documentar todos los endpoints

## Seguridad
- **Autenticación**: Implementar sistemas de autenticación robustos
- **Autorización**: Control de acceso basado en roles
- **Validación**: Validar todos los datos de entrada
- **Rate Limiting**: Limitar solicitudes por usuario/IP

Una API REST bien diseñada es la base de aplicaciones web escalables y mantenibles.`,
    author: "Arquitecto de Software",
    tags: ["api", "rest", "arquitectura", "backend", "mejores-practicas"],
    likesCount: 31,
    viewsCount: 250
  },
  {
    title: "Desarrollo Frontend Moderno con React",
    slug: "desarrollo-frontend-moderno-react",
    content: `React es una biblioteca de JavaScript para construir interfaces de usuario, especialmente aplicaciones de una sola página (SPA). Desarrollada por Facebook, React ha revolucionado el desarrollo frontend moderno.

## ¿Qué es React?
React es una biblioteca que permite crear interfaces de usuario mediante componentes reutilizables. Utiliza un DOM virtual para optimizar el rendimiento y proporciona una experiencia de desarrollo declarativa.

## Características principales
- **Componentes**: Arquitectura basada en componentes reutilizables
- **JSX**: Sintaxis que permite escribir HTML en JavaScript
- **Virtual DOM**: Optimización del rendimiento mediante DOM virtual
- **Unidireccional**: Flujo de datos unidireccional
- **Ecosistema**: Amplio ecosistema de herramientas y librerías

## Conceptos fundamentales
### Componentes
Los componentes son bloques de construcción reutilizables que encapsulan lógica y presentación.

### Props
Las props son datos que se pasan de componentes padre a componentes hijo.

### State
El estado es datos que pueden cambiar durante el ciclo de vida del componente.

### Hooks
Los hooks permiten usar estado y otras características de React en componentes funcionales.

## Ventajas de React
- **Reutilización**: Componentes reutilizables
- **Rendimiento**: Optimizado con Virtual DOM
- **Ecosistema**: Amplio ecosistema de herramientas
- **Comunidad**: Gran comunidad y soporte
- **Flexibilidad**: Puede usarse en diferentes contextos

## Casos de uso
- Aplicaciones web de una sola página
- Interfaces de usuario complejas
- Aplicaciones móviles (React Native)
- Dashboards y aplicaciones de administración

React es una herramienta poderosa para crear interfaces de usuario modernas y eficientes.`,
    author: "Desarrollador Frontend",
    tags: ["react", "frontend", "javascript", "ui", "componentes"],
    likesCount: 28,
    viewsCount: 200
  },
  {
    title: "Integración Frontend-Backend: Comunicación Eficiente",
    slug: "integracion-frontend-backend-comunicacion-eficiente",
    content: `La integración entre frontend y backend es crucial para el éxito de cualquier aplicación web. Una comunicación eficiente entre estas capas puede mejorar significativamente la experiencia del usuario y el rendimiento de la aplicación.

## Modelos de comunicación
### API REST
- **HTTP/HTTPS**: Protocolo estándar para comunicación web
- **JSON**: Formato de intercambio de datos
- **Códigos de estado**: Comunicación del estado de las operaciones
- **Métodos HTTP**: Semántica clara para diferentes operaciones

### WebSockets
- **Conexión persistente**: Comunicación bidireccional en tiempo real
- **Baja latencia**: Ideal para aplicaciones en tiempo real
- **Eventos**: Comunicación basada en eventos

## Mejores prácticas
### Frontend
- **Manejo de estado**: Gestión eficiente del estado de la aplicación
- **Caché**: Implementar estrategias de caché apropiadas
- **Loading states**: Mostrar estados de carga para mejor UX
- **Error handling**: Manejo robusto de errores
- **Optimistic updates**: Actualizaciones optimistas para mejor UX

### Backend
- **Validación**: Validar todos los datos de entrada
- **Autenticación**: Implementar sistemas de autenticación seguros
- **Rate limiting**: Limitar solicitudes para prevenir abuso
- **Logging**: Registrar eventos importantes para debugging
- **Documentación**: Documentar APIs para facilitar integración

## Herramientas de integración
### HTTP Clients
- **Axios**: Cliente HTTP popular para JavaScript
- **Fetch API**: API nativa del navegador
- **jQuery AJAX**: Para aplicaciones legacy

### Estado global
- **Redux**: Gestión de estado predecible
- **Context API**: API nativa de React para estado global
- **Zustand**: Biblioteca ligera para gestión de estado

## Patrones de diseño
- **MVC**: Modelo-Vista-Controlador
- **MVVM**: Modelo-Vista-VistaModelo
- **Flux**: Patrón de arquitectura unidireccional
- **CQRS**: Separación de comandos y consultas

Una integración bien diseñada entre frontend y backend es esencial para aplicaciones web modernas exitosas.`,
    author: "Arquitecto Full Stack",
    tags: ["frontend", "backend", "integracion", "api", "comunicacion"],
    likesCount: 19,
    viewsCount: 150
  },
  {
    title: "La Evolución del Fútbol Moderno: Tácticas y Tecnología",
    slug: "evolucion-futbol-moderno-tacticas-tecnologia",
    content: `El fútbol ha experimentado una transformación radical en las últimas décadas, evolucionando desde un deporte tradicional hacia una disciplina altamente tecnificada y tácticamente sofisticada.

## La Revolución Táctica

### Tiki-Taka y el Dominio del Balón
El estilo de juego desarrollado por el FC Barcelona y la selección española revolucionó el fútbol mundial. Esta filosofía se basa en:
- **Posesión del balón**: Mantener la pelota el mayor tiempo posible
- **Pases cortos y precisos**: Construcción de juego desde atrás
- **Presión alta**: Recuperación inmediata tras pérdida
- **Movimiento constante**: Desplazamientos sin balón

### Gegenpressing: La Contraofensiva Moderna
Desarrollado por Jürgen Klopp, este sistema se caracteriza por:
- **Presión intensa**: Presionar inmediatamente tras pérdida
- **Transiciones rápidas**: Cambio de defensa a ataque en segundos
- **Intensidad física**: Alto ritmo durante 90 minutos
- **Trabajo en equipo**: Coordinación perfecta entre líneas

## Tecnología en el Fútbol

### Análisis de Datos
- **Expected Goals (xG)**: Métrica que evalúa la calidad de las oportunidades
- **Heat Maps**: Mapas de calor para analizar movimientos
- **Pases y posesión**: Estadísticas detalladas de cada jugador
- **Análisis táctico**: Software especializado para entrenadores

### VAR y Tecnología de Línea de Gol
- **Video Assistant Referee**: Revisión de decisiones arbitrales
- **Goal Line Technology**: Detección automática de goles
- **Offside Technology**: Líneas automáticas para fuera de juego
- **Análisis de rendimiento**: Monitoreo en tiempo real

## Tendencias Actuales

### Fútbol Posicional
- **Zonas de influencia**: Cada jugador tiene áreas específicas
- **Superioridad numérica**: Crear ventajas en diferentes zonas
- **Juego en espacios**: Aprovechar espacios entre líneas
- **Flexibilidad táctica**: Adaptación durante el partido

### Preparación Física Avanzada
- **GPS y sensores**: Monitoreo de distancias y velocidad
- **Análisis de fatiga**: Prevención de lesiones
- **Nutrición especializada**: Dietas personalizadas
- **Recuperación activa**: Técnicas de regeneración

## El Futuro del Fútbol

### Inteligencia Artificial
- **Análisis predictivo**: Predecir movimientos del rival
- **Scouting automatizado**: Identificación de talentos
- **Tácticas personalizadas**: Adaptación al estilo del rival
- **Prevención de lesiones**: Predicción basada en datos

### Sostenibilidad
- **Fútbol ecológico**: Reducción de huella de carbono
- **Estadios inteligentes**: Eficiencia energética
- **Transporte sostenible**: Movilidad responsable
- **Comunidades locales**: Impacto social positivo

El fútbol moderno es una combinación perfecta entre tradición y innovación, donde la tecnología y la táctica se unen para crear un espectáculo cada vez más emocionante y competitivo.`,
    author: "Analista Deportivo",
    tags: ["futbol", "tacticas", "tecnologia", "deporte", "analisis"],
    likesCount: 45,
    viewsCount: 320
  },
  {
    title: "Economía Digital: El Impacto de las Criptomonedas y Blockchain",
    slug: "economia-digital-criptomonedas-blockchain",
    content: `La economía digital está transformando fundamentalmente la forma en que concebimos el dinero, las transacciones y la confianza en el sistema financiero global.

## La Revolución de las Criptomonedas

### Bitcoin: El Origen de Todo
Bitcoin, creado en 2009 por Satoshi Nakamoto, introdujo conceptos revolucionarios:
- **Descentralización**: Sin necesidad de bancos centrales
- **Transparencia**: Todas las transacciones son públicas
- **Escasez digital**: Limitación de 21 millones de bitcoins
- **Resistencia a la censura**: Imposible de confiscar o congelar

### Ethereum y los Contratos Inteligentes
Ethereum expandió las posibilidades con:
- **Smart Contracts**: Contratos autoejecutables
- **Aplicaciones Descentralizadas (DApps)**: Software sin servidor central
- **Tokens**: Creación de activos digitales personalizados
- **DeFi**: Finanzas descentralizadas

## Blockchain: La Tecnología Subyacente

### Características Principales
- **Inmutabilidad**: Los datos no pueden ser alterados
- **Distribución**: Copias en múltiples nodos
- **Consenso**: Mecanismos de validación distribuidos
- **Transparencia**: Registro público de transacciones

### Casos de Uso Empresariales
- **Cadena de suministro**: Trazabilidad de productos
- **Identidad digital**: Verificación sin intermediarios
- **Votación electrónica**: Sistemas electorales seguros
- **Propiedad intelectual**: Protección de derechos de autor

## DeFi: Finanzas Descentralizadas

### Servicios Tradicionales Reimaginados
- **Préstamos**: Sin intermediarios bancarios
- **Intercambios**: Trading sin custodia central
- **Seguros**: Pólizas automatizadas
- **Ahorro**: Yield farming y staking

### Ventajas del DeFi
- **Accesibilidad global**: Disponible 24/7
- **Transparencia total**: Código abierto
- **Interoperabilidad**: Integración entre protocolos
- **Innovación constante**: Desarrollo comunitario

## Regulación y Adopción Institucional

### Desafíos Regulatorios
- **Marco legal**: Necesidad de regulación clara
- **Protección al consumidor**: Prevención de fraudes
- **Estabilidad financiera**: Gestión de riesgos sistémicos
- **Lavado de dinero**: Cumplimiento AML/KYC

### Adopción Corporativa
- **Tesla**: Inversión en Bitcoin
- **MicroStrategy**: Reserva de valor corporativa
- **PayPal**: Integración de pagos con cripto
- **Bancos centrales**: CBDCs en desarrollo

## Impacto Económico Global

### Inclusión Financiera
- **Acceso bancario**: Servicios para no bancarizados
- **Remesas**: Transferencias más baratas y rápidas
- **Microfinanzas**: Préstamos P2P
- **Educación financiera**: Alfabetización digital

### Nuevos Modelos de Negocio
- **NFTs**: Propiedad digital única
- **Metaverso**: Economías virtuales
- **Play-to-Earn**: Juegos que generan ingresos
- **DAO**: Organizaciones autónomas descentralizadas

## Desafíos y Oportunidades

### Riesgos Actuales
- **Volatilidad**: Fluctuaciones de precio extremas
- **Escalabilidad**: Limitaciones técnicas
- **Energía**: Consumo eléctrico significativo
- **Usabilidad**: Barreras técnicas para usuarios

### Oportunidades Futuras
- **Web3**: Internet descentralizado
- **Tokenización**: Activos del mundo real
- **Identidad soberana**: Control total de datos personales
- **Economía colaborativa**: Nuevos modelos de cooperación

La economía digital representa un cambio de paradigma hacia un sistema más inclusivo, transparente y eficiente, aunque requiere educación, regulación inteligente y adopción gradual para alcanzar su máximo potencial.`,
    author: "Economista Digital",
    tags: ["economia", "criptomonedas", "blockchain", "defi", "finanzas"],
    likesCount: 38,
    viewsCount: 280
  },
  {
    title: "Política y Tecnología: La Transformación Digital de la Democracia",
    slug: "politica-tecnologia-transformacion-digital-democracia",
    content: `La intersección entre política y tecnología está redefiniendo la forma en que los ciudadanos participan en la vida democrática, desde el voto electrónico hasta la participación ciudadana digital.

## La Era de la Democracia Digital

### Participación Ciudadana Online
Las plataformas digitales han democratizado la participación política:
- **Consultas ciudadanas**: Encuestas y referendos digitales
- **Presupuestos participativos**: Decisión directa sobre gasto público
- **Iniciativas legislativas**: Propuestas ciudadanas online
- **Transparencia gubernamental**: Datos abiertos y accesibles

### Redes Sociales y Opinión Pública
- **Campaigning digital**: Estrategias de comunicación política
- **Fact-checking**: Verificación de información
- **Echo chambers**: Cámaras de eco y polarización
- **Influencers políticos**: Nuevos líderes de opinión

## Voto Electrónico y Seguridad

### Sistemas de Votación Digital
- **Voto por internet**: Participación remota
- **Máquinas de votación**: Tecnología en urnas
- **Blockchain voting**: Sistemas descentralizados
- **Verificación de identidad**: Biometría y autenticación

### Desafíos de Seguridad
- **Ciberseguridad**: Protección contra ataques
- **Auditabilidad**: Verificación de resultados
- **Privacidad**: Protección del voto secreto
- **Accesibilidad**: Inclusión de todos los ciudadanos

## Inteligencia Artificial en Política

### Análisis de Datos Políticos
- **Predicción electoral**: Modelos de comportamiento
- **Análisis de sentimientos**: Opinión pública en tiempo real
- **Targeting político**: Segmentación de audiencias
- **Detección de fake news**: Combate a la desinformación

### Automatización Gubernamental
- **Chatbots gubernamentales**: Atención ciudadana 24/7
- **Procesamiento de documentos**: Automatización de trámites
- **Análisis de políticas**: Evaluación de impacto
- **Optimización de servicios**: Mejora de eficiencia

## Transparencia y Rendición de Cuentas

### Gobierno Abierto
- **Datos abiertos**: Información pública accesible
- **Transparencia presupuestaria**: Seguimiento del gasto público
- **Contrataciones públicas**: Procesos transparentes
- **Declaraciones patrimoniales**: Acceso a información de funcionarios

### Tecnologías de Auditoría
- **Blockchain gubernamental**: Registros inmutables
- **Trazabilidad de fondos**: Seguimiento de recursos
- **Auditoría en tiempo real**: Monitoreo continuo
- **Reportes automatizados**: Información actualizada

## Desafíos de la Democracia Digital

### Brecha Digital
- **Acceso a internet**: Conectividad universal
- **Alfabetización digital**: Educación tecnológica
- **Dispositivos**: Acceso a hardware necesario
- **Competencias digitales**: Habilidades requeridas

### Desinformación y Manipulación
- **Deepfakes**: Videos falsos generados por IA
- **Bots y trolls**: Manipulación de conversaciones
- **Algoritmos de recomendación**: Cámaras de eco
- **Propaganda digital**: Campañas de desinformación

## Innovaciones Democráticas

### Democracia Deliberativa
- **Asambleas ciudadanas**: Participación directa
- **Jurados ciudadanos**: Decisión sobre políticas
- **Presupuestos participativos**: Decisión sobre gasto
- **Consultas vinculantes**: Referendos digitales

### Tecnologías Emergentes
- **Realidad virtual**: Experiencias inmersivas
- **Internet de las cosas**: Ciudades inteligentes
- **5G**: Conectividad de alta velocidad
- **Edge computing**: Procesamiento distribuido

## Regulación y Gobernanza

### Marco Legal Digital
- **Ley de protección de datos**: Privacidad ciudadana
- **Regulación de plataformas**: Responsabilidad de intermediarios
- **Ciberseguridad nacional**: Protección de infraestructura
- **Derechos digitales**: Nuevos derechos ciudadanos

### Cooperación Internacional
- **Estándares globales**: Normas comunes
- **Ciberseguridad**: Colaboración contra amenazas
- **Intercambio de mejores prácticas**: Aprendizaje mutuo
- **Gobernanza de internet**: Regulación global

## El Futuro de la Democracia

### Tendencias Emergentes
- **Democracia líquida**: Delegación flexible de votos
- **Gobernanza algorítmica**: Decisiones automatizadas
- **Ciudadanía global**: Participación transnacional
- **Democracia directa**: Participación sin intermediarios

### Preparación para el Futuro
- **Educación cívica digital**: Formación ciudadana
- **Infraestructura tecnológica**: Inversión en conectividad
- **Marco regulatorio**: Adaptación legal
- **Participación inclusiva**: Democratización del acceso

La transformación digital de la democracia ofrece oportunidades sin precedentes para una participación ciudadana más amplia y efectiva, pero requiere un enfoque equilibrado que combine innovación tecnológica con valores democráticos fundamentales.`,
    author: "Especialista en Política Digital",
    tags: ["politica", "tecnologia", "democracia", "voto-electronico", "transparencia"],
    likesCount: 42,
    viewsCount: 310
  },
  {
    title: "Arte Contemporáneo y Tecnología: La Revolución Digital en las Artes Visuales",
    slug: "arte-contemporaneo-tecnologia-revolucion-digital-artes-visuales",
    content: `El arte contemporáneo está experimentando una transformación radical gracias a la integración de tecnologías digitales, creando nuevas formas de expresión y experiencias artísticas nunca antes vistas.

## La Convergencia Arte-Tecnología

### Arte Digital: Nuevos Medios, Nuevas Posibilidades
El arte digital ha abierto horizontes infinitos para la creatividad:
- **Arte generativo**: Creaciones algorítmicas y procedimentales
- **Realidad virtual**: Experiencias inmersivas tridimensionales
- **Realidad aumentada**: Superposición de elementos digitales
- **Arte interactivo**: Participación activa del espectador

### NFTs y la Revolución del Arte Digital
Los Non-Fungible Tokens han transformado la forma de poseer y comercializar arte:
- **Propiedad digital**: Certificación de autenticidad
- **Mercados descentralizados**: Comercio sin intermediarios
- **Royalties automáticos**: Ingresos continuos para artistas
- **Nuevos coleccionistas**: Audiencias globales

## Inteligencia Artificial en el Arte

### Creación Asistida por IA
- **Generadores de imágenes**: DALL-E, Midjourney, Stable Diffusion
- **Arte colaborativo**: Humanos y máquinas creando juntos
- **Estilos híbridos**: Fusión de técnicas tradicionales y digitales
- **Personalización masiva**: Arte adaptado a preferencias individuales

### Curaduría y Análisis
- **Recomendaciones personalizadas**: Algoritmos de descubrimiento
- **Análisis de tendencias**: Predicción de movimientos artísticos
- **Autenticación**: Detección de falsificaciones
- **Catalogación automática**: Organización de colecciones

## Realidad Virtual y Aumentada

### Experiencias Inmersivas
- **Museos virtuales**: Exposiciones sin límites físicos
- **Instalaciones interactivas**: Arte que responde al movimiento
- **Narrativas inmersivas**: Historias contadas en 360°
- **Colaboración remota**: Creación artística a distancia

### Aplicaciones Prácticas
- **Restauración digital**: Preservación de obras históricas
- **Educación artística**: Aprendizaje inmersivo
- **Terapia artística**: Tratamientos con realidad virtual
- **Accesibilidad**: Arte para personas con discapacidades

## Blockchain y Arte

### Trazabilidad y Autenticidad
- **Proveniencia**: Historial completo de obras
- **Certificados digitales**: Autenticación inmutable
- **Contratos inteligentes**: Acuerdos automáticos
- **Mercados secundarios**: Comercio transparente

### Nuevos Modelos de Negocio
- **Fractional ownership**: Propiedad fraccionada
- **Arte como inversión**: Tokens de arte
- **Crowdfunding artístico**: Financiación colectiva
- **Licencias dinámicas**: Uso flexible de derechos

## Arte Interactivo y Participativo

### Experiencias Colaborativas
- **Arte crowdsourced**: Creación colectiva
- **Instalaciones sensoriales**: Arte que responde a estímulos
- **Performance digital**: Espectáculos híbridos
- **Gamificación artística**: Arte como juego

### Tecnologías Emergentes
- **Holografía**: Proyecciones tridimensionales
- **Arte robótico**: Esculturas y pinturas automatizadas
- **Biotecnología**: Arte con organismos vivos
- **Nanotecnología**: Arte a escala molecular

## Preservación y Conservación Digital

### Desafíos de la Conservación
- **Obsolescencia tecnológica**: Hardware y software obsoletos
- **Degradación digital**: Pérdida de datos
- **Formato de archivos**: Compatibilidad futura
- **Documentación**: Registro de procesos creativos

### Soluciones Innovadoras
- **Emulación**: Recreación de sistemas antiguos
- **Migración**: Actualización de formatos
- **Documentación exhaustiva**: Registro detallado
- **Backup distribuido**: Almacenamiento redundante

## Educación y Formación Artística

### Nuevos Currículos
- **Arte y tecnología**: Programas interdisciplinarios
- **Coding creativo**: Programación para artistas
- **Diseño de experiencias**: UX/UI artístico
- **Emprendimiento artístico**: Modelos de negocio

### Herramientas de Aprendizaje
- **Tutoriales interactivos**: Aprendizaje inmersivo
- **Simuladores**: Práctica sin materiales costosos
- **Comunidades online**: Colaboración global
- **Mentoría digital**: Guía remota

## Impacto Social y Cultural

### Democratización del Arte
- **Acceso global**: Arte sin barreras geográficas
- **Costos reducidos**: Herramientas asequibles
- **Diversidad de voces**: Inclusión de nuevos artistas
- **Educación masiva**: Aprendizaje accesible

### Nuevos Públicos
- **Generación digital**: Nativos tecnológicos
- **Coleccionistas jóvenes**: Nuevos mercados
- **Comunidades online**: Audiencias globales
- **Gamers**: Crossover con videojuegos

## Desafíos y Oportunidades

### Cuestiones Éticas
- **Autoría**: ¿Quién es el creador real?
- **Originalidad**: ¿Qué es único en la era digital?
- **Acceso**: ¿Cómo mantener la inclusión?
- **Sostenibilidad**: ¿Impacto ambiental del arte digital?

### Futuro del Arte
- **Metaverso**: Mundos virtuales artísticos
- **Arte cuántico**: Aplicaciones de física cuántica
- **Neuroarte**: Arte basado en actividad cerebral
- **Arte espacial**: Creaciones en el espacio exterior

La revolución digital en las artes visuales no solo está cambiando cómo creamos y consumimos arte, sino que está redefiniendo fundamentalmente qué consideramos arte y cómo interactuamos con él en el siglo XXI.`,
    author: "Curadora de Arte Digital",
    tags: ["arte", "tecnologia", "digital", "nft", "realidad-virtual"],
    likesCount: 35,
    viewsCount: 250
  }
];

const sampleComments = [
  {
    articleSlug: "introduccion-nodejs-express",
    author: "Estudiante Dev",
    email: "estudiante@universidad.edu",
    content: "Excelente artículo! Muy claro y bien explicado. Me ayudó mucho a entender los conceptos básicos de Node.js."
  },
  {
    articleSlug: "introduccion-nodejs-express",
    author: "Profesor JS",
    email: "profesor@universidad.edu",
    content: "Muy buen contenido. Sugeriría agregar más ejemplos prácticos de middleware en Express."
  },
  {
    articleSlug: "mongodb-nosql-aplicaciones-web",
    author: "DevOps Engineer",
    email: "devops@empresa.com",
    content: "MongoDB es realmente una excelente opción para aplicaciones web modernas. La flexibilidad del esquema es una ventaja enorme."
  },
  {
    articleSlug: "arquitectura-apis-rest-mejores-practicas",
    author: "Senior Developer",
    email: "senior@tech.com",
    content: "Las mejores prácticas mencionadas son fundamentales. El versionado de APIs es algo que muchos desarrolladores pasan por alto."
  },
  {
    articleSlug: "desarrollo-frontend-moderno-react",
    author: "React Enthusiast",
    email: "react@dev.com",
    content: "React ha cambiado completamente la forma en que desarrollo interfaces. Los hooks son una característica increíble."
  },
  {
    articleSlug: "evolucion-futbol-moderno-tacticas-tecnologia",
    author: "Entrenador de Fútbol",
    email: "entrenador@club.com",
    content: "Excelente análisis del fútbol moderno. La tecnología está revolucionando la forma de entrenar y analizar el juego. El VAR ha sido un gran avance para la justicia deportiva."
  },
  {
    articleSlug: "evolucion-futbol-moderno-tacticas-tecnologia",
    author: "Analista Deportivo",
    email: "analista@deportes.com",
    content: "Muy interesante el enfoque sobre el gegenpressing. Klopp realmente cambió la forma de entender el fútbol moderno. Los datos y la tecnología son fundamentales ahora."
  },
  {
    articleSlug: "economia-digital-criptomonedas-blockchain",
    author: "Inversor Cripto",
    email: "inversor@crypto.com",
    content: "Artículo muy completo sobre el ecosistema cripto. DeFi está democratizando las finanzas de una manera increíble. Los NFTs también están cambiando el arte digital."
  },
  {
    articleSlug: "economia-digital-criptomonedas-blockchain",
    author: "Economista Tradicional",
    email: "economista@universidad.edu",
    content: "Interesante perspectiva sobre la economía digital. Aunque soy escéptico sobre las criptomonedas, no puedo negar que blockchain tiene aplicaciones muy prometedoras."
  },
  {
    articleSlug: "politica-tecnologia-transformacion-digital-democracia",
    author: "Activista Digital",
    email: "activista@democracia.org",
    content: "La democracia digital es el futuro. Las plataformas de participación ciudadana están empoderando a la gente. El voto electrónico podría aumentar la participación electoral."
  },
  {
    articleSlug: "politica-tecnologia-transformacion-digital-democracia",
    author: "Funcionario Público",
    email: "funcionario@gobierno.gov",
    content: "Como funcionario, veo los desafíos de implementar tecnología en el gobierno. La transparencia es crucial, pero también la seguridad de los datos ciudadanos."
  },
  {
    articleSlug: "arte-contemporaneo-tecnologia-revolucion-digital-artes-visuales",
    author: "Artista Digital",
    email: "artista@digital.com",
    content: "Los NFTs han abierto nuevas posibilidades para los artistas digitales. Ahora podemos monetizar nuestro trabajo de manera directa sin intermediarios. La realidad virtual es increíble para crear experiencias inmersivas."
  },
  {
    articleSlug: "arte-contemporaneo-tecnologia-revolucion-digital-artes-visuales",
    author: "Curador de Arte",
    email: "curador@museo.org",
    content: "Como curador, veo cómo la tecnología está transformando el arte. Los museos virtuales permiten acceso global, pero también plantean desafíos para la conservación digital."
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando inserción de datos de prueba...');

    // Limpiar datos existentes
    await Article.deleteMany({});
    await Comment.deleteMany({});
    console.log('🧹 Datos existentes eliminados');

    // Insertar artículos
    const articles = await Article.insertMany(sampleArticles);
    console.log(`✅ ${articles.length} artículos insertados`);

    // Insertar comentarios
    const comments = [];
    for (const commentData of sampleComments) {
      const article = articles.find(a => a.slug === commentData.articleSlug);
      if (article) {
        const comment = await Comment.create({
          articleId: article._id,
          author: commentData.author,
          email: commentData.email,
          content: commentData.content
        });
        comments.push(comment);
      }
    }
    console.log(`✅ ${comments.length} comentarios insertados`);

    // Mostrar resumen
    console.log('\n📊 Resumen de datos insertados:');
    console.log(`- Artículos: ${articles.length}`);
    console.log(`- Comentarios: ${comments.length}`);
    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('\n🔗 Puedes probar la API en:');
    console.log('- http://localhost:3000/api/articles');
    console.log('- http://localhost:3000/api/articles/introduccion-nodejs-express');
    console.log('- http://localhost:3000/api/articles/evolucion-futbol-moderno-tacticas-tecnologia');
    console.log('- http://localhost:3000/api/articles/economia-digital-criptomonedas-blockchain');
    console.log('- http://localhost:3000/api/articles/politica-tecnologia-transformacion-digital-democracia');
    console.log('- http://localhost:3000/api/articles/arte-contemporaneo-tecnologia-revolucion-digital-artes-visuales');
    console.log('- http://localhost:3000/api/articles/stats');

  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔒 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar script
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

runSeed();


