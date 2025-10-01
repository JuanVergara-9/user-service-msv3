'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('user_profiles', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: S.INTEGER, allowNull:false, unique:true }, // viene del JWT
      first_name: { type: S.STRING(60) },
      last_name:  { type: S.STRING(60) },
      date_of_birth: { type: S.DATEONLY },
      province: { type: S.STRING(80) },
      city: { type: S.STRING(80) },
      locality: { type: S.STRING(80) },
      address: { type: S.STRING(160) },
      phone_e164: { type: S.STRING(32) },
      avatar_url: { type: S.STRING(255) },
      public_profile: { type: S.BOOLEAN, allowNull:false, defaultValue:true },
      default_location_source: { type: S.STRING(10), allowNull:false, defaultValue:'city' }, // gps|city|manual
      created_at: { type: S.DATE, allowNull:false, defaultValue:S.fn('NOW') },
      updated_at: { type: S.DATE, allowNull:false, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('user_profiles', ['city'], { name:'user_profiles_city_idx' });
    await q.addIndex('user_profiles', ['phone_e164'], { name:'user_profiles_phone_idx' });
  },
  async down(q){ await q.dropTable('user_profiles'); }
};
