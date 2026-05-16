const { getCache, setCache } = require('../utils/cache.util');
const { Facultad, Sede, Ciclo, Seccion, Jornada, Departamento, Municipio, PlanParqueo, Multa } = require('../model/catalogos.model');
const Rol = require('../model/rol.model');

class CatalogoStore {
  /**
   * Helper: ejecuta una query Sequelize, cachea el resultado, y mapea las llaves
   * para que el frontend reciba exactamente lo que espera (ej: ID_FACULTAD, NOMBRE_FACULTAD).
   */
  static async getWithCache(cacheKey, model, options, keyMap) {
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const rows = await model.findAll(options);
    const mapped = rows.map(r => {
      const plain = r.get({ plain: true });
      if (!keyMap) return plain;
      const out = {};
      for (const [dbKey, frontKey] of Object.entries(keyMap)) {
        out[frontKey] = plain[dbKey];
      }
      return out;
    });

    setCache(cacheKey, mapped);
    return mapped;
  }

  static async getFacultades() {
    return this.getWithCache('facultades', Facultad,
      { order: [['FAC_NOMBRE_FACULTAD', 'ASC']] },
      { FAC_ID_FACULTAD: 'ID_FACULTAD', FAC_NOMBRE_FACULTAD: 'NOMBRE_FACULTAD' }
    );
  }

  static async getSedes() {
    return this.getWithCache('sedes', Sede,
      { order: [['SEC_NOMBRE_SEDE', 'ASC']] },
      { SEC_ID_SEDE: 'ID_SEDE', SEC_NOMBRE_SEDE: 'NOMBRE_SEDE' }
    );
  }

  static async getCiclos() {
    return this.getWithCache('ciclos', Ciclo,
      { order: [['CIC_ID_CICLO', 'ASC']] },
      { CIC_ID_CICLO: 'ID_CICLO', CIC_NOMBRE_CICLO: 'NOMBRE_CICLO' }
    );
  }

  static async getSecciones() {
    return this.getWithCache('secciones', Seccion,
      { order: [['SEC_ID_SECCION', 'ASC']] },
      { SEC_ID_SECCION: 'ID_SECCION', SEC_NOMBRE_SECCION: 'NOMBRE_SECCION' }
    );
  }

  static async getJornadas() {
    return this.getWithCache('jornadas', Jornada,
      { where: { JOR_ACTIVO: 1 }, order: [['JOR_ID_JORNADA', 'ASC']] },
      { JOR_ID_JORNADA: 'ID_JORNADA', JOR_NOMBRE_JORNADA: 'NOMBRE_JORNADA' }
    );
  }

  static async getDepartamentos() {
    return this.getWithCache('departamentos', Departamento,
      { order: [['DEP_NOMBRE_DEPARTAMENTO', 'ASC']] },
      { DEP_ID_DEPARTAMENTO: 'ID_DEPARTAMENTO', DEP_NOMBRE_DEPARTAMENTO: 'NOMBRE_DEPARTAMENTO' }
    );
  }

  static async getPlanes() {
    const rows = await PlanParqueo.findAll({
      where: { PLN_ESTADO_REGISTRO: 'A' },
      order: [['PLN_PRECIO', 'DESC']]
    });
    return rows.map(r => r.get({ plain: true }));
  }

  static async getRoles() {
    return this.getWithCache('roles', Rol,
      { where: { ROL_ESTADO: 1 }, order: [['ROL_ID_ROL', 'ASC']] },
      { ROL_ID_ROL: 'ID_ROL', ROL_NOMBRE_ROL: 'NOMBRE_ROL' }
    );
  }

  static async getMunicipios(idDepto) {
    const cacheKey = `municipios_${idDepto}`;
    return this.getWithCache(cacheKey, Municipio,
      { where: { DEP_ID_DEPARTAMENTO: parseInt(idDepto) }, order: [['MUN_NOMBRE_MUNICIPIO', 'ASC']] },
      { MUN_ID_MUNICIPIO: 'ID_MUNICIPIO', MUN_NOMBRE_MUNICIPIO: 'NOMBRE_MUNICIPIO' }
    );
  }

  static async getMultasCatalogo() {
    return this.getWithCache('multasCatalogo', Multa,
      {},
      null // Frontend usa MUL_MULTA, MUL_DESCRIPCION, MUL_MONTO_TOTAL directamente
    );
  }
}

module.exports = CatalogoStore;
