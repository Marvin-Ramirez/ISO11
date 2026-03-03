export const defaultSubjects = [
  // ===== PRIMER CUATRIMESTRE =====
  {
    id: '1',
    code: 'ESP101',
    name: 'ANALISIS DE TEXTOS DISCURSIVOS',
    credits: 3,
    semester: 1,
    prerequisites: [],
    completed: false
  },
  {
    id: '2',
    code: 'ISO100',
    name: 'FUNDAMENTOS DE INFORMATICA Y ALGORITMOS',
    credits: 5,
    semester: 1,
    prerequisites: [],
    completed: false
  },
  {
    id: '3',
    code: 'ISO105',
    name: 'FUNDAMENTOS DE SISTEMAS OPERATIVOS Y COMUNICACIONES',
    credits: 3,
    semester: 1,
    prerequisites: [],
    completed: false
  },
  {
    id: '4',
    code: 'SOC011',
    name: 'HISTORIA SOCIAL DOMINICANA',
    credits: 3,
    semester: 1,
    prerequisites: [],
    completed: false
  },
  {
    id: '5',
    code: 'SOC030',
    name: 'ORIENTACION UNIVERSITARIA',
    credits: 2,
    semester: 1,
    prerequisites: [],
    completed: false
  },
  {
    id: '6',
    code: 'MAT127',
    name: 'MATEMATICA SUPERIOR PARA INGENIERIA',
    credits: 5,
    semester: 1,
    prerequisites: [],
    completed: false
  },
  {
    id: '7',
    code: 'INF250',
    name: 'FUNDAMENTOS DE INGENIERIA',
    credits: 2,
    semester: 1,
    prerequisites: [],
    completed: false
  },
  {
    id: '8',
    code: 'ENG001',
    name: 'INGLES I',
    credits: 0,
    semester: 1,
    prerequisites: [],
    completed: false
  },

  // ===== SEGUNDO CUATRIMESTRE =====
  {
    id: '9',
    code: 'SOC043',
    name: 'GESTION AMBIENTAL',
    credits: 2,
    semester: 2,
    prerequisites: [],
    completed: false
  },
  {
    id: '10',
    code: 'ESP106',
    name: 'REDACCION DE TEXTOS DISCURSIVOS I',
    credits: 3,
    semester: 2,
    prerequisites: ['ESP101'],
    completed: false
  },
  {
    id: '11',
    code: 'SOC200',
    name: 'INTRODUCCION A LA SOCIOLOGIA',
    credits: 3,
    semester: 2,
    prerequisites: [],
    completed: false
  },
  {
    id: '12',
    code: 'SOC101',
    name: 'INTRODUCCION A LA PSICOLOGIA',
    credits: 3,
    semester: 2,
    prerequisites: [],
    completed: false
  },
  {
    id: '13',
    code: 'MAT131',
    name: 'CALCULO Y GEOMETRIA ANALITICA I',
    credits: 5,
    semester: 2,
    prerequisites: ['MAT127'],
    completed: false
  },
  {
    id: '14',
    code: 'ISO200',
    name: 'PROGRAMACION Y ESTRUCTURAS DE DATOS',
    credits: 5,
    semester: 2,
    prerequisites: ['ISO100'],
    completed: false
  },
  {
    id: '15',
    code: 'ENG002',
    name: 'INGLES II',
    credits: 0,
    semester: 2,
    prerequisites: ['ENG001'],
    completed: false
  },

  // ===== TERCER CUATRIMESTRE =====
  {
    id: '16',
    code: 'INF111',
    name: 'PROGRAMACION ORIENTADA A OBJETOS',
    credits: 3,
    semester: 3,
    prerequisites: ['ISO200'],
    completed: false
  },
  {
    id: '17',
    code: 'ISO300',
    name: 'FUNDAMENTOS DE INGENIERIA DE SOFTWARE',
    credits: 4,
    semester: 3,
    prerequisites: ['INF250'],
    completed: false
  },
  {
    id: '18',
    code: 'ESP107',
    name: 'REDACCION DE TEXTOS DISCURSIVOS II',
    credits: 3,
    semester: 3,
    prerequisites: ['ESP106'],
    completed: false
  },
  {
    id: '19',
    code: 'MAT132',
    name: 'CALCULO Y GEOMETRIA ANALITICA II',
    credits: 5,
    semester: 3,
    prerequisites: ['MAT131'],
    completed: false
  },
  {
    id: '20',
    code: 'ING716',
    name: 'FISICA I',
    credits: 3,
    semester: 3,
    prerequisites: ['MAT131'],
    completed: false
  },
  {
    id: '21',
    code: 'ING717',
    name: 'LABORATORIO DE FISICA I',
    credits: 1,
    semester: 3,
    prerequisites: ['MAT131'],
    completed: false
  },
  {
    id: '22',
    code: 'ISO310',
    name: 'DISEÑO WEB',
    credits: 4,
    semester: 3,
    prerequisites: ['ISO200'],
    completed: false
  },
  {
    id: '23',
    code: 'ENG003',
    name: 'INGLES III',
    credits: 0,
    semester: 3,
    prerequisites: ['ENG002'],
    completed: false
  },

  // ===== CUARTO CUATRIMESTRE =====
  {
    id: '24',
    code: 'INF164',
    name: 'BASE DE DATOS I',
    credits: 3,
    semester: 4,
    prerequisites: ['INF111'],
    completed: false
  },
  {
    id: '25',
    code: 'ISO410',
    name: 'VERIFICACION Y VALIDACION DE SOFTWARE',
    credits: 4,
    semester: 4,
    prerequisites: ['ISO300'],
    completed: false
  },
  {
    id: '26',
    code: 'SOC013',
    name: 'FILOSOFIA',
    credits: 2,
    semester: 4,
    prerequisites: [],
    completed: false
  },
  {
    id: '27',
    code: 'SOC253',
    name: 'METODOLOGIA Y TECNICAS DE INVESTIGACION',
    credits: 4,
    semester: 4,
    prerequisites: [],
    completed: false
  },
  {
    id: '28',
    code: 'MAT151',
    name: 'MATEMATICA DISCRETA',
    credits: 4,
    semester: 4,
    prerequisites: ['MAT132'],
    completed: false
  },
  {
    id: '29',
    code: 'SOC031',
    name: 'ETICA PROFESIONAL',
    credits: 3,
    semester: 4,
    prerequisites: [],
    completed: false
  },
  {
    id: '30',
    code: 'ISO500',
    name: 'INGENIERIA DE REQUISITOS',
    credits: 3,
    semester: 4,
    prerequisites: ['ISO300'],
    completed: false
  },
  {
    id: '31',
    code: 'ENG004',
    name: 'INGLES IV',
    credits: 0,
    semester: 4,
    prerequisites: ['ENG003'],
    completed: false
  },

  // ===== QUINTO CUATRIMESTRE =====
  {
    id: '32',
    code: 'INF165',
    name: 'BASE DE DATOS II',
    credits: 3,
    semester: 5,
    prerequisites: ['INF164'],
    completed: false
  },
  {
    id: '33',
    code: 'ISO505',
    name: 'INGENIERIA DE LA USABILIDAD',
    credits: 3,
    semester: 5,
    prerequisites: ['ISO410'],
    completed: false
  },
  {
    id: '34',
    code: 'CON127',
    name: 'CONTABILIDAD DE COSTOS PARA INGENIEROS',
    credits: 3,
    semester: 5,
    prerequisites: ['MAT127'],
    completed: false
  },
  {
    id: '35',
    code: 'ING718',
    name: 'FISICA II',
    credits: 3,
    semester: 5,
    prerequisites: ['ING716'],
    completed: false
  },
  {
    id: '36',
    code: 'ING719',
    name: 'LABORATORIO DE FISICA II',
    credits: 1,
    semester: 5,
    prerequisites: ['ING717'],
    completed: false
  },
  {
    id: '37',
    code: 'ISO515',
    name: 'PROGRAMACION WEB',
    credits: 3,
    semester: 5,
    prerequisites: ['ISO310'],
    completed: false
  },
  {
    id: '38',
    code: 'ADM535',
    name: 'ACTITUD EMPRENDEDORA',
    credits: 3,
    semester: 5,
    prerequisites: ['SOC101'],
    completed: false
  },
  {
    id: '39',
    code: 'ISO400',
    name: 'ANALISIS Y DISEÑO ORIENTADO A OBJETOS',
    credits: 4,
    semester: 5,
    prerequisites: ['ISO500'],
    completed: false
  },
  {
    id: '40',
    code: 'ENG005',
    name: 'INGLES V',
    credits: 0,
    semester: 5,
    prerequisites: ['ENG004'],
    completed: false
  },

  // ===== SEXTO CUATRIMESTRE =====
  {
    id: '41',
    code: 'ISO600',
    name: 'ADMINISTRACION DE CONFIGURACION',
    credits: 3,
    semester: 6,
    prerequisites: ['ISO400'],
    completed: false
  },
  {
    id: '42',
    code: 'MAT252',
    name: 'PROBABILIDAD Y ESTADISTICA',
    credits: 4,
    semester: 6,
    prerequisites: ['MAT132'],
    completed: false
  },
  {
    id: '43',
    code: 'ISO615',
    name: 'DESARROLLO DE SOFTWARE CON TECNOLOGIAS PROPIETARIAS Y OPEN SOURCE I',
    credits: 4,
    semester: 6,
    prerequisites: ['INF165'],
    completed: false
  },
  {
    id: '44',
    code: 'ISO625',
    name: 'PROGRAMACION MOVIL',
    credits: 4,
    semester: 6,
    prerequisites: ['ISO515'],
    completed: false
  },
  {
    id: '45',
    code: 'ENG006',
    name: 'INGLES VI',
    credits: 0,
    semester: 6,
    prerequisites: ['ENG005'],
    completed: false
  },
  {
    id: '46',
    code: 'ODEP',
    name: 'OPTATIVA DEPORTE',
    credits: 0,
    semester: 6,
    prerequisites: [],
    completed: false
  },

  // ===== SÉPTIMO CUATRIMESTRE =====
  {
    id: '47',
    code: 'ISO700',
    name: 'GESTION DE SITIOS WEB',
    credits: 3,
    semester: 7,
    prerequisites: ['ISO505'],
    completed: false
  },
  {
    id: '48',
    code: 'ISO705',
    name: 'PROYECTO DE SOFTWARE I',
    credits: 4,
    semester: 7,
    prerequisites: ['ISO600'],
    completed: false
  },
  {
    id: '49',
    code: 'ISO720',
    name: 'DESARROLLO DE SOFTWARE CON TECNOLOGIAS PROPIETARIAS Y OPEN SOURCE II',
    credits: 4,
    semester: 7,
    prerequisites: ['ISO615'],
    completed: false
  },
  {
    id: '50',
    code: 'ISO735',
    name: 'SEGURIDAD DE SOFTWARE',
    credits: 3,
    semester: 7,
    prerequisites: [],
    completed: false
  },
  {
    id: '51',
    code: 'E077',
    name: 'ELECTIVA I ISO-11',
    credits: 3,
    semester: 7,
    prerequisites: [],
    completed: false
  },
  {
    id: '52',
    code: 'ENG007',
    name: 'INGLES VII',
    credits: 0,
    semester: 7,
    prerequisites: ['ENG006'],
    completed: false
  },

  // ===== OCTAVO CUATRIMESTRE =====
  {
    id: '53',
    code: 'ISO800',
    name: 'GESTION DE CALIDAD DE SOFTWARE',
    credits: 3,
    semester: 8,
    prerequisites: ['ISO735'],
    completed: false
  },
  {
    id: '54',
    code: 'ISO725',
    name: 'INTEGRACION DE APLICACIONES CON TECNOLOGIAS PROPIETARIAS Y OPEN SOURCE',
    credits: 4,
    semester: 8,
    prerequisites: ['ISO720'],
    completed: false
  },
  {
    id: '55',
    code: 'ISO934',
    name: 'PROYECTO DE SOFTWARE II',
    credits: 4,
    semester: 8,
    prerequisites: ['ISO705'],
    completed: false
  },
  {
    id: '56',
    code: 'E078',
    name: 'ELECTIVA II-ISO11',
    credits: 3,
    semester: 8,
    prerequisites: [],
    completed: false
  },
  {
    id: '57',
    code: 'ENG008',
    name: 'INGLES VIII',
    credits: 0,
    semester: 8,
    prerequisites: ['ENG007'],
    completed: false
  },

  // ===== NOVENO CUATRIMESTRE =====
  {
    id: '58',
    code: 'IDI045',
    name: 'INGLES PARA INFORMATICA I',
    credits: 3,
    semester: 9,
    prerequisites: ['ENG008'],
    completed: false
  },
  {
    id: '59',
    code: 'ISO900',
    name: 'ADMINISTRACION DE DESARROLLO',
    credits: 4,
    semester: 9,
    prerequisites: ['ISO800'],
    completed: false
  },
  {
    id: '60',
    code: 'INF900',
    name: 'INGENIERIA COMERCIAL',
    credits: 3,
    semester: 9,
    prerequisites: [],
    completed: false
  },
  {
    id: '61',
    code: 'ISO912',
    name: 'ARQUITECTURA DE DESARROLLO CON TECNOLOGIAS PROPIETARIAS Y OPEN SOURCE',
    credits: 4,
    semester: 9,
    prerequisites: ['ISO725'],
    completed: false
  },
  {
    id: '62',
    code: 'ISO931',
    name: 'INTELIGENCIA DE NEGOCIOS',
    credits: 3,
    semester: 9,
    prerequisites: ['ISO700'],
    completed: false
  },
  {
    id: '63',
    code: 'E079',
    name: 'ELECTIVA III-ISO11',
    credits: 3,
    semester: 9,
    prerequisites: [],
    completed: false
  },

  // ===== DÉCIMO CUATRIMESTRE =====
  {
    id: '64',
    code: 'IDI046',
    name: 'INGLES PARA INFORMATICA II',
    credits: 3,
    semester: 10,
    prerequisites: ['IDI045'],
    completed: false
  },
  {
    id: '65',
    code: 'ISO937',
    name: 'COMPUTACION UBICUA',
    credits: 4,
    semester: 10,
    prerequisites: ['ISO931'],
    completed: false
  },
  {
    id: '66',
    code: 'ISO940',
    name: 'IMPLEMENTACION DE ECOMMERCE CON TECNOLOGIAS PROPIETARIAS Y OPEN SOURCE',
    credits: 4,
    semester: 10,
    prerequisites: ['ISO912'],
    completed: false
  },
  {
    id: '67',
    code: 'DER010',
    name: 'EDUCACION CONSTITUCIONAL',
    credits: 3,
    semester: 10,
    prerequisites: [],
    completed: false
  },
  {
    id: '68',
    code: 'ISO936',
    name: 'PROYECTO DE SOFTWARE III',
    credits: 4,
    semester: 10,
    prerequisites: ['ISO934'],
    completed: false
  },
  {
    id: '69',
    code: 'PAS261',
    name: 'PASANTIA EMPRESARIAL',
    credits: 0,
    semester: 10,
    prerequisites: [],
    completed: false
  },

  // ===== DÉCIMO PRIMER CUATRIMESTRE =====
  {
    id: '70',
    code: 'SOC281',
    name: 'SEMINARIO DE GRADO',
    credits: 3,
    semester: 11,
    prerequisites: ['SOC253'],
    completed: false,
    specialPrerequisite: '90% de los créditos aprobados'
  },
  {
    id: '71',
    code: 'ISO945',
    name: 'SISTEMAS DE INFORMACION GEOGRAFICA',
    credits: 3,
    semester: 11,
    prerequisites: ['ISO937'],
    completed: false
  },
  {
    id: '72',
    code: 'DER800',
    name: 'DERECHO APLICADO A LA INFORMATICA',
    credits: 3,
    semester: 11,
    prerequisites: [],
    completed: false
  },
  {
    id: '73',
    code: 'ISC835',
    name: 'COMPUTACION FORENSE Y CIBERSEGURIDAD',
    credits: 3,
    semester: 11,
    prerequisites: [],
    completed: false
  },
  {
    id: '74',
    code: 'INF610',
    name: 'AUDITORIA DE SISTEMAS INFORMATICOS',
    credits: 3,
    semester: 11,
    prerequisites: [],
    completed: false
  },

  // ===== DÉCIMO SEGUNDO CUATRIMESTRE =====
  {
    id: '75',
    code: 'TFG',
    name: 'TRABAJO FINAL DE GRADO',
    credits: 6,
    semester: 12,
    prerequisites: [],
    completed: false
  }
];

export const semesters = [
  { number: 1, name: 'Primer Cuatrimestre' },
  { number: 2, name: 'Segundo Cuatrimestre' },
  { number: 3, name: 'Tercer Cuatrimestre' },
  { number: 4, name: 'Cuarto Cuatrimestre' },
  { number: 5, name: 'Quinto Cuatrimestre' },
  { number: 6, name: 'Sexto Cuatrimestre' },
  { number: 7, name: 'Séptimo Cuatrimestre' },
  { number: 8, name: 'Octavo Cuatrimestre' },
  { number: 9, name: 'Noveno Cuatrimestre' },
  { number: 10, name: 'Décimo Cuatrimestre' },
  { number: 11, name: 'Décimo Primer Cuatrimestre' },
  { number: 12, name: 'Décimo Segundo Cuatrimestre' },
];