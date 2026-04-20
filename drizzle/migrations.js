// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_crazy_king_bedlam.sql';
import m0001 from './0001_calm_gamma_corps.sql';
import m0002 from './0002_mushy_rick_jones.sql';
import m0003 from './0003_silent_secret_warriors.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  